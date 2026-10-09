# Zunjay Arcade — Block Drop

React + TypeScript + Vite 기반 테트리스 스타일 블록 퍼즐입니다.

Node.js 24 LTS를 권장합니다. 별도 서버나 환경 변수는 필요하지 않습니다.

## 실행

```sh
npm install
npm run dev
```

## 빌드

```sh
npm run build
npm run preview
```

방향키 좌우로 이동, 위로 회전, 아래로 빠르게 내리기, Space로 바로 떨어뜨리기, P 또는 Esc로 일시정지합니다. 모바일에서는 화면의 조작 버튼을 사용하세요. 최고 점수는 브라우저에 저장됩니다. 10줄을 지울 때마다 레벨과 낙하 속도가 올라갑니다. 창을 벗어나면 자동으로 일시정지합니다.

Vercel에서 이 GitHub 저장소를 가져오고 Framework Preset은 Vite, Build Command는 `npm run build`, Output Directory는 `dist`로 설정하세요.

## GitHub 및 배포

원격 저장소: https://github.com/zunjay54-boop/Zunjay_project

최초 업로드에 앞서 GitHub 계정에 로그인합니다.

```sh
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
git push -u origin main
```

Vercel에서 **Add New → Project**로 이 저장소를 가져오세요. `vercel.json`에 Vite 빌드 설정이 포함되어 있습니다. 연결 후에는 main 브랜치에 push할 때마다 자동 배포됩니다. GitHub Actions는 push와 pull request마다 게임 규칙 테스트와 빌드를 실행합니다.

## 검증

```sh
npm test
```

줄 삭제, 점수 계산, 충돌, 일시정지, 게임오버, 블록 주머니, 상태 계산의 재현성을 검증합니다. 최고 기록은 현재 브라우저의 localStorage에만 저장되며 기기 사이에 동기화되지 않습니다.
