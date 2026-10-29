"""Dependency-free execution of real route/decorator code; no model or API calls."""

from __future__ import annotations

import ast
import functools
import inspect
import unittest
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[1]


class HTTPException(Exception):
    def __init__(self, status_code, detail=None):
        self.status_code = status_code
        self.detail = detail


class ReachedRun(Exception):
    pass


def load_boundary(relative, name):
    namespace = {"functools": functools, "inspect": inspect, "HTTPException": HTTPException}
    tree = ast.parse((ROOT / "app/gateway/authz.py").read_text())
    selected = [n for n in tree.body if isinstance(n, (ast.ClassDef, ast.FunctionDef)) and n.name in {"AuthContext", "require_permission"}]

    def compile_nodes(nodes):
        module = ast.Module(body=[ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0), *nodes], type_ignores=[])
        exec(compile(ast.fix_missing_locations(module), relative, "exec"), namespace)

    compile_nodes(selected)
    tree = ast.parse((ROOT / relative).read_text())
    route = next(n for n in tree.body if isinstance(n, ast.AsyncFunctionDef) and n.name == name)
    route.decorator_list = [d for d in route.decorator_list if not (isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute) and isinstance(d.func.value, ast.Name) and d.func.value.id == "router")]
    compile_nodes([route])

    async def start_run(*args):
        raise ReachedRun

    namespace.update(_resolve_thread_id=lambda body: "own-thread", get_stream_bridge=lambda request: None, get_run_manager=lambda request: None, start_run=start_run)
    return namespace[name], namespace["AuthContext"]


class RoutePermissionBoundaryTest(unittest.IsolatedAsyncioTestCase):
    async def test_denied_route_permission_stops_before_handler_side_effects(self):
        for relative, name in [
            ("app/gateway/routers/runs.py", "stateless_stream"),
            ("app/gateway/routers/runs.py", "stateless_wait"),
            ("app/gateway/routers/threads.py", "create_thread"),
            ("app/gateway/routers/threads.py", "search_threads"),
        ]:
            handler, auth = load_boundary(relative, name)
            with self.subTest(route=name):
                request = SimpleNamespace(state=SimpleNamespace(auth=auth(user=SimpleNamespace(id="user"), permissions=[])))
                with self.assertRaises(HTTPException) as denied:
                    await handler(body=SimpleNamespace(), request=request)
                self.assertEqual(403, denied.exception.status_code)

    async def test_allowed_runs_reach_existing_launch_path_and_anonymous_is_rejected(self):
        for name in ["stateless_stream", "stateless_wait"]:
            handler, auth = load_boundary("app/gateway/routers/runs.py", name)
            request = SimpleNamespace(state=SimpleNamespace(auth=auth(user=SimpleNamespace(id="user"), permissions=["runs:create"])))
            with self.assertRaises(ReachedRun):
                await handler(body=SimpleNamespace(), request=request)
            request.state.auth = auth(user=None, permissions=[])
            with self.assertRaises(HTTPException) as denied:
                await handler(body=SimpleNamespace(), request=request)
            self.assertEqual(401, denied.exception.status_code)


if __name__ == "__main__":
    unittest.main()
