from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "agent"


def test_rewrite_section_returns_structured_diff() -> None:
    payload = {
        "version": "v1",
        "documentId": "2e6f8cb3-a90b-49e7-b163-e2e0d15db034",
        "sectionId": "1ad864c1-6689-4cdf-8506-267bb8de57f8",
        "content": "Example sentence to rewrite.",
        "context": [],
        "tone": "neutral",
    }
    response = client.post("/rewrite-section", json=payload)
    assert response.status_code == 200

    body = response.json()
    assert body["version"] == "v1"
    assert body["suggestion"]["operations"][0]["operation"] == "replace"
