from schemas.agent import AgentContextBlock


class EmbeddingService:
    def generate_embedding(self, text: str) -> list[float]:
        vector = [0.0] * 8
        if text:
            vector[0] = float(len(text))
        return vector

    def embed_context(self, sections: list[AgentContextBlock]) -> dict[str, list[float]]:
        return {section.blockId: self.generate_embedding(section.content) for section in sections}
