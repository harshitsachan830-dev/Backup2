import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import { hasPaidAccess } from "@/lib/payment";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProjectStatus = "Planning" | "In progress" | "Completed";
const projectStatuses: ProjectStatus[] = ["Planning", "In progress", "Completed"];

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(request: NextRequest, context: ProjectRouteContext) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to update your projects." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Project updates must include valid JSON." }, { status: 400 });
  }

  const record = typeof payload === "object" && payload !== null
    ? payload as Record<string, unknown>
    : {};
  const updates: { name?: string; description?: string; status?: ProjectStatus } = {};

  if ("name" in record) {
    const name = typeof record.name === "string" ? record.name.trim() : "";
    if (!name || name.length > 120) {
      return NextResponse.json(
        { error: "Project names must contain between 1 and 120 characters." },
        { status: 400 },
      );
    }
    updates.name = name;
  }
  if ("description" in record) {
    const description = typeof record.description === "string" ? record.description.trim() : "";
    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Project descriptions must be 1000 characters or fewer." },
        { status: 400 },
      );
    }
    updates.description = description;
  }
  if ("status" in record) {
    if (!projectStatuses.includes(record.status as ProjectStatus)) {
      return NextResponse.json({ error: "Choose a valid project status." }, { status: 400 });
    }
    updates.status = record.status as ProjectStatus;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Add at least one project field to update." }, { status: 400 });
  }

  try {
    if (!(await hasPaidAccess(user.id))) {
      return NextResponse.json({ error: "Purchase ModelMind access to use projects." }, { status: 402 });
    }

    const client = getSupabaseAdminClient();
    const { data: current, error: readError } = await client
      .from("projects")
      .select("project_data")
      .eq("id", (await context.params).projectId)
      .eq("user_id", user.supabaseUserId)
      .maybeSingle();
    if (readError) {
      console.error("Could not find the authenticated owner's project to update.", readError);
      return NextResponse.json({ error: "Could not update this project." }, { status: 503 });
    }
    if (!current) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const oldData = typeof current.project_data === "object" && current.project_data !== null
      ? current.project_data as Record<string, unknown>
      : {};
    const projectData = { ...oldData };
    if (updates.description !== undefined) projectData.description = updates.description;
    if (updates.status !== undefined) projectData.status = updates.status;

    const databaseUpdate: { name?: string; project_data?: Record<string, unknown> } = {};
    if (updates.name !== undefined) databaseUpdate.name = updates.name;
    if (updates.description !== undefined || updates.status !== undefined) {
      databaseUpdate.project_data = projectData;
    }

    const { data, error } = await client
      .from("projects")
      .update(databaseUpdate)
      .eq("id", (await context.params).projectId)
      .eq("user_id", user.supabaseUserId)
      .select("id, name, created_at, updated_at, project_data")
      .maybeSingle();
    if (error) {
      console.error("Could not update a project for the authenticated owner.", error);
      return NextResponse.json({ error: "Could not save your project changes." }, { status: 503 });
    }
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ project: data });
  } catch (error) {
    console.error("Could not connect to the projects database.", error);
    return NextResponse.json({ error: "Project storage is not configured or is unavailable." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest, context: ProjectRouteContext) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to delete your projects." }, { status: 401 });
  }

  try {
    if (!(await hasPaidAccess(user.id))) {
      return NextResponse.json({ error: "Purchase ModelMind access to use projects." }, { status: 402 });
    }
    const { data, error } = await getSupabaseAdminClient()
      .from("projects")
      .delete()
      .eq("id", (await context.params).projectId)
      .eq("user_id", user.supabaseUserId)
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("Could not delete a project for the authenticated owner.", error);
      return NextResponse.json({ error: "Could not delete this project." }, { status: 503 });
    }
    if (!data) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not connect to the projects database.", error);
    return NextResponse.json({ error: "Project storage is not configured or is unavailable." }, { status: 503 });
  }
}
