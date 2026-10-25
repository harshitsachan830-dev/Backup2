import json
import urllib.error
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import main

app = main.app


client = TestClient(app)


def test_health_reports_the_configured_jupyter_port():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["jupyter_port"] == 8899


def test_local_runtime_accepts_the_configured_dashboard_origin():
    response = client.post(
        "/runtime",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 200
    session_id = response.json()["session_id"]

    cleanup = client.delete(
        f"/runtime/{session_id}",
        headers={"Origin": "http://localhost:3000"},
    )
    assert cleanup.status_code == 200


def test_local_runtime_rejects_unconfigured_website_origins():
    response = client.post(
        "/runtime",
        headers={"Origin": "https://untrusted.example"},
    )

    assert response.status_code == 403


def test_jupyter_open_uses_a_one_time_launch_id_and_redirects_to_authenticated_lab(
    monkeypatch,
):
    def running_server(**kwargs):
        assert kwargs["runtime_dir"]
        return iter(
            [
                {
                    "url": "http://localhost:8899/",
                    "port": 8899,
                    "base_url": "/",
                    "token": "local-test-token",
                    "password": False,
                }
            ]
        )

    monkeypatch.setattr("main.list_running_servers", running_server)
    prepared = client.post(
        "/jupyter/prepare",
        headers={"Origin": "http://localhost:3000"},
    )
    assert prepared.status_code == 200

    response = client.get(
        f"/jupyter/open?launch_id={prepared.json()['launch_id']}",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert response.headers["location"] == "http://127.0.0.1:8899/lab/?token=local-test-token"

    replay = client.get(
        f"/jupyter/open?launch_id={prepared.json()['launch_id']}",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert replay.status_code == 403


def test_dashboard_can_open_a_separate_trainer_notebook(monkeypatch):
    def running_server(**kwargs):
        assert kwargs["runtime_dir"]
        return iter(
            [
                {
                    "url": "http://localhost:8899/",
                    "port": 8899,
                    "base_url": "/",
                    "token": "local-test-token",
                    "password": False,
                }
            ]
        )

    monkeypatch.setattr("main.list_running_servers", running_server)
    monkeypatch.setattr(
        "main._ensure_jupyter_notebook",
        lambda server, notebook_type: "Trainer-Notebook.ipynb",
    )
    prepared = client.post(
        "/jupyter/prepare",
        json={"notebook_type": "trainer"},
        headers={"Origin": "http://localhost:3000"},
    )
    assert prepared.status_code == 200

    response = client.get(
        f"/jupyter/open?launch_id={prepared.json()['launch_id']}",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert response.headers["location"] == (
        "http://127.0.0.1:8899/lab/tree/Trainer-Notebook.ipynb"
        "?token=local-test-token"
    )


def test_jupyter_prepare_rejects_an_unknown_notebook_type():
    response = client.post(
        "/jupyter/prepare",
        json={"notebook_type": "admin"},
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 422


def test_trainer_notebook_is_created_with_trainer_metadata(monkeypatch):
    requests = []

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return None

        def read(self):
            return b"{}"

    def fake_open(request, timeout):
        requests.append(request)
        assert timeout == 5
        if request.full_url.endswith("/lab/"):
            return Response()
        if request.method == "GET":
            raise urllib.error.HTTPError(
                request.full_url, 404, "Not found", {}, None
            )
        return Response()

    monkeypatch.setattr(
        main.urllib.request,
        "build_opener",
        lambda *_handlers: SimpleNamespace(open=fake_open),
    )
    monkeypatch.setattr(main, "_load_jupyter_xsrf_token", lambda *_args: "test-xsrf")

    filename = main._ensure_jupyter_notebook(
        {
            "url": "http://localhost:8899/",
            "port": 8899,
            "base_url": "/",
            "token": "local-test-token",
        },
        "trainer",
    )

    assert filename == "Trainer-Notebook.ipynb"
    assert requests[0].get_header("Authorization") == "token local-test-token"
    assert requests[0].get_header("X-xsrftoken") == "test-xsrf"
    created = json.loads(requests[1].data)
    assert created["content"]["metadata"]["modelmind_notebook_type"] == "trainer"
    assert created["content"]["cells"][1]["cell_type"] == "code"


def test_jupyter_xsrf_helper_requires_the_server_cookie():
    cookie = SimpleNamespace(name="_xsrf", value="test-xsrf")
    cookie_jar = [cookie]

    class Response:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return None

    class Opener:
        def open(self, request, timeout):
            assert request.full_url == "http://127.0.0.1:8899/lab/"
            assert timeout == 5
            return Response()

    assert main._load_jupyter_xsrf_token(
        Opener(),
        cookie_jar,
        "http://127.0.0.1:8899/lab/",
        {"Authorization": "token local-test-token"},
    ) == "test-xsrf"

    with pytest.raises(RuntimeError, match="required XSRF cookie"):
        main._load_jupyter_xsrf_token(
            Opener(),
            [],
            "http://127.0.0.1:8899/lab/",
            {},
        )


def test_jupyter_prepare_rejects_untrusted_origins():
    response = client.post(
        "/jupyter/prepare",
        headers={"Origin": "https://untrusted.example"},
    )
    assert response.status_code == 403


def test_jupyter_open_rejects_missing_or_replayed_launch_id():
    invalid_id = "x" * 43
    response = client.get(
        f"/jupyter/open?launch_id={invalid_id}",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert response.status_code == 403
    assert "expired" in response.text.lower()

    no_id_response = client.get(
        "/jupyter/open",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert no_id_response.status_code == 403
    assert "open notebook from modelmind" in no_id_response.text.lower()


def test_jupyter_open_does_not_redirect_to_an_unauthenticated_server(monkeypatch):
    def running_server(**kwargs):
        assert kwargs["runtime_dir"]
        return iter(
            [
                {
                    "url": "http://127.0.0.1:8899/",
                    "port": 8899,
                    "base_url": "/",
                    "token": "",
                    "password": False,
                }
            ]
        )

    monkeypatch.setattr("main.list_running_servers", running_server)
    launch_id = client.post(
        "/jupyter/prepare",
        headers={"Origin": "http://localhost:3000"},
    ).json()["launch_id"]
    response = client.get(
        f"/jupyter/open?launch_id={launch_id}",
        headers={"Origin": "null"},
        follow_redirects=False,
    )
    assert response.status_code == 503
    assert "authentication is not configured" in response.text.lower()


def test_cors_preflight_advertises_only_a_configured_dashboard_origin():
    response = client.options(
        "/runtime",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-credentials" not in response.headers


def test_cors_preflight_advertises_private_network_access():
    response = client.options(
        "/jupyter/prepare",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
            "Access-Control-Request-Private-Network": "true",
        },
    )

    assert response.status_code == 200
    assert response.headers.get("access-control-allow-private-network") == "true"


def test_jupyter_open_allows_direct_navigation_from_trusted_referer(monkeypatch):
    def running_server(**kwargs):
        assert kwargs["runtime_dir"]
        return iter(
            [
                {
                    "url": "http://localhost:8899/",
                    "port": 8899,
                    "base_url": "/",
                    "token": "local-test-token",
                    "password": False,
                }
            ]
        )

    monkeypatch.setattr("main.list_running_servers", running_server)
    response = client.get(
        "/jupyter/open",
        headers={"Referer": "http://localhost:3000/notebook"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    assert response.headers["location"] == "http://127.0.0.1:8899/lab/?token=local-test-token"
