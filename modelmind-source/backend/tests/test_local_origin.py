from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


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


def test_jupyter_open_redirects_to_authenticated_local_lab(monkeypatch):
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

    monkeypatch.setattr(
        "main.list_running_servers",
        running_server,
    )

    response = client.post(
        "/jupyter/open",
        headers={"Origin": "http://localhost:3000"},
        follow_redirects=False,
    )

    assert response.status_code == 303
    assert response.headers["location"] == (
        "http://127.0.0.1:8899/lab/?token=local-test-token"
    )


def test_jupyter_open_requires_an_allowed_origin():
    response = client.post("/jupyter/open")

    assert response.status_code == 403


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

    monkeypatch.setattr(
        "main.list_running_servers",
        running_server,
    )

    response = client.post(
        "/jupyter/open",
        headers={"Origin": "http://localhost:3000"},
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
