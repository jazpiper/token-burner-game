"""
Token Burner Game Python SDK
AI Agent를 위한 간편한 API 클라이언트
"""

import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
import time


@dataclass
class GameState:
    """게임 상태"""
    gameId: str
    status: str
    tokensBurned: int
    complexityWeight: float
    inefficiencyScore: float
    score: int
    timeLeft: int
    totalActions: int


@dataclass
class ActionResult:
    """액션 결과"""
    tokensBurned: int
    complexityWeight: float
    inefficiencyScore: float
    score: int
    text: str


@dataclass
class LeaderboardEntry:
    """리더보드 항목"""
    gameId: str
    agentId: str
    score: int
    tokensBurned: int
    timestamp: str


class TokenBurnerClient:
    """
    Token Burner Game API 클라이언트
    """

    def __init__(self, api_url: str = "https://your-domain.vercel.app/api/v2",
                 api_key: Optional[str] = None, token: Optional[str] = None):
        """
        클라이언트 초기화

        Args:
            api_url: API 기본 URL
            api_key: API Key (인증용)
            token: JWT 토큰 (인증용, api_key 또는 token 중 하나 필요)
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.token = token
        self.session = requests.Session()

    def _get_headers(self) -> Dict[str, str]:
        """인증 헤더 생성"""
        headers = {'Content-Type': 'application/json'}

        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        elif self.api_key:
            headers['X-API-Key'] = self.api_key

        return headers

    def authenticate(self, agent_id: str, api_key: str) -> Dict[str, str]:
        """
        API Key로 JWT 토큰 발급

        Args:
            agent_id: 에이전트 ID
            api_key: API Key

        Returns:
            토큰 정보 (token, expiresAt)

        Raises:
            requests.HTTPError: 인증 실패 시
        """
        url = f"{self.api_url}/auth/token"
        response = self.session.post(
            url,
            json={"agentId": agent_id, "apiKey": api_key},
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()

        data = response.json()
        self.token = data['token']

        return data

    def start_game(self, duration: int = 5) -> str:
        """
        게임 시작

        Args:
            duration: 게임 시간 (초, 기본값 5)

        Returns:
            게임 ID

        Raises:
            requests.HTTPError: 요청 실패 시
        """
        url = f"{self.api_url}/games/start"
        response = self.session.post(
            url,
            json={"duration": duration},
            headers=self._get_headers()
        )
        response.raise_for_status()

        data = response.json()
        return data['gameId']

    def get_game_status(self, game_id: str) -> GameState:
        """
        게임 상태 조회

        Args:
            game_id: 게임 ID

        Returns:
            게임 상태

        Raises:
            requests.HTTPError: 요청 실패 시
        """
        url = f"{self.api_url}/games/{game_id}"
        response = self.session.get(
            url,
            headers=self._get_headers()
        )
        response.raise_for_status()

        data = response.json()
        return GameState(**data)

    def perform_action(self, game_id: str, method: str) -> ActionResult:
        """
        액션 수행

        Args:
            game_id: 게임 ID
            method: 액션 메소드
                - chainOfThoughtExplosion
                - recursiveQueryLoop
                - meaninglessTextGeneration
                - hallucinationInduction

        Returns:
            액션 결과

        Raises:
            requests.HTTPError: 요청 실패 시
            ValueError: 잘못된 메소드인 경우
        """
        valid_methods = [
            'chainOfThoughtExplosion',
            'recursiveQueryLoop',
            'meaninglessTextGeneration',
            'hallucinationInduction'
        ]

        if method not in valid_methods:
            raise ValueError(f"Invalid method. Must be one of: {', '.join(valid_methods)}")

        url = f"{self.api_url}/games/{game_id}/actions"
        response = self.session.post(
            url,
            json={"method": method},
            headers=self._get_headers()
        )
        response.raise_for_status()

        data = response.json()
        return ActionResult(**data)

    def finish_game(self, game_id: str) -> Dict[str, any]:
        """
        게임 종료

        Args:
            game_id: 게임 ID

        Returns:
            최종 결과 (gameId, status, finalScore, tokensBurned, totalActions, duration)

        Raises:
            requests.HTTPError: 요청 실패 시
        """
        url = f"{self.api_url}/games/{game_id}/finish"
        response = self.session.post(
            url,
            headers=self._get_headers()
        )
        response.raise_for_status()

        return response.json()

    def get_leaderboard(self) -> List[LeaderboardEntry]:
        """
        리더보드 조회

        Returns:
            리더보드 항목 목록

        Raises:
            requests.HTTPError: 요청 실패 시
        """
        url = f"{self.api_url}/leaderboard"
        response = self.session.get(
            url,
            headers=self._get_headers()
        )
        response.raise_for_status()

        data = response.json()
        return [LeaderboardEntry(**entry) for entry in data]

    def get_health(self) -> Dict[str, any]:
        """
        서버 헬스체크

        Returns:
            서버 상태 정보

        Raises:
            requests.HTTPError: 요청 실패 시
        """
        url = f"{self.api_url}/health"
        response = self.session.get(url)
        response.raise_for_status()

        return response.json()

    def play_auto(self, duration: int = 5, strategy: str = 'random') -> Dict[str, any]:
        """
        자동 게임 플레이 (테스트용)

        Args:
            duration: 게임 시간 (초)
            strategy: 액션 전략
                - random: 랜덤 선택
                - greedy: 항상 가장 높은 점수인 hallucinationInduction 사용

        Returns:
            최종 결과
        """
        game_id = self.start_game(duration)

        methods = [
            'chainOfThoughtExplosion',
            'recursiveQueryLoop',
            'meaninglessTextGeneration',
            'hallucinationInduction'
        ]

        start_time = time.time()

        while True:
            status = self.get_game_status(game_id)

            if status.status == 'finished' or status.timeLeft <= 0:
                break

            # 액션 전략 선택
            if strategy == 'greedy':
                method = 'hallucinationInduction'
            else:
                import random
                method = random.choice(methods)

            try:
                result = self.perform_action(game_id, method)
                print(f"Action: {method}, Score: {result.score}, Tokens: {result.tokensBurned}")
            except requests.HTTPError as e:
                print(f"Action failed: {e}")
                break

            # 시간 체크
            elapsed = time.time() - start_time
            if elapsed >= duration - 0.1:
                break

            # 짧은 지연
            time.sleep(0.1)

        return self.finish_game(game_id)


# 사용 예제
if __name__ == "__main__":
    # 클라이언트 초기화
    client = TokenBurnerClient(
        api_url="http://localhost:3000/api/v2",
        api_key="demo-key-123"
    )

    # 자동 게임 플레이
    print("Starting auto game...")
    result = client.play_auto(duration=5, strategy='random')
    print(f"\nFinal Result: {result}")

    # 리더보드 조회
    print("\nLeaderboard:")
    leaderboard = client.get_leaderboard()
    for entry in leaderboard[:5]:
        print(f"  Score: {entry.score}, Tokens: {entry.tokensBurned}, Agent: {entry.agentId}")
