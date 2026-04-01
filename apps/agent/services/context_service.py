from schemas.agent import AgentContextBlock


class ContextService:
    def chunk_sections(self, sections: list[AgentContextBlock]) -> list[AgentContextBlock]:
        return sections

    def retrieve_relevant(
        self,
        section_id: str,
        sections: list[AgentContextBlock],
        limit: int = 5,
    ) -> list[AgentContextBlock]:
        candidates = [section for section in sections if section.blockId != section_id]
        return candidates[:limit]
