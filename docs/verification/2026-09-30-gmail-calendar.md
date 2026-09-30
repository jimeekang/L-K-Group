# Gmail 문의·Calendar 기능 검증

2026-09-30 · [실행 명세](../plans/28-gmail-enquiry-calendar-implementation.md) · 회사 Google OAuth 클라이언트 미설정

## 검증 환경

- Node.js 24.14.1, npm 11.11.0, Next.js 16.3.6. 로컬 `127.0.0.1:3002`.
- 개발 브라우저 검증은 `/private/tmp/lk-gmail-calendar-qa/operations.sqlite`와 합성 고객만 사용했다. 회사 Gmail·Calendar·실제 고객 메일은 접근하지 않았다.
- 실제 in-app 브라우저에서 데스크톱/모바일 viewport를 바꿔 확인했다. 실제 휴대폰·외부 운영 배포 검증은 아니다.

## 실제 브라우저·HTTP 확인

- KCP의 헤더·Hero·하단 및 모바일 메뉴의 견적 링크가 같은 요청 폼을 가리킨다. 모바일 메뉴 열기·Escape 닫기·키보드 링크 이동을 확인했다.
- 폼의 빈 필수값 오류, 첫 오류 항목 포커스, 단계 이동·입력 보존, 줄바꿈 메모, 희망일의 검토 요약 반영을 확인했다. 날짜 input의 값이 React 상태에 반영되지 않던 문제는 수정 후 재확인했다.
- 데스크톱 문의 `KCP-2B35B5C57BBB`, 390px 모바일의 날짜 미정 문의 `KCP-0DBAB5587F9F`가 서버 저장 후 접수 번호를 표시했다. 320px 접수 완료 화면 가로 넘침 없음. 모바일 문의의 경고·오류 콘솔 기록 없음.
- 잘못된 관리자 비밀번호 거절, 정상 로그인, 저장된 문의 상세·줄바꿈·희망일 표시를 확인했다.
- 종료가 시작보다 이른 입력을 거절했다. Sydney 2026-10-12 09:00–17:00을 저장한 후 `provisional`·Calendar `pending` 상태를 확인했다. 확정 예약·Google 전송 성공으로 표시하지 않는다.
- 인증 없는 `/api/operations` 요청은 401, 다른 Origin의 로그인 POST는 403이었다. 응답에 `Cache-Control: no-store`와 `X-Robots-Tag: noindex, nofollow`를 확인했다.
- Google 키가 없을 때 설정 누락·연결 대기를 표시하며 Calendar/라벨 선택·동기화 버튼을 비활성화한다.
- 임시 DB에 합성 Gmail 메시지 2건과 가져오기 실패 1건을 넣어 실제 운영 화면을 확인했다. 동일 대화는 `KCP-3A001618ECBA` 문의 1개로 표시되고 두 본문·메시지 ID·수신 시각·첨부 개수·truncated 상태가 보존됐다. `<img src=x onerror=alert(1)>` 문자열은 텍스트로 표시되며 해당 이미지 DOM은 생성되지 않았다. 실패 목록에 메시지 ID와 과대 응답 이유가 표시됐다. 1280px 및 320px 상세 가로 넘침과 콘솔 경고·오류가 없었다. 이는 실제 Gmail API 수신 테스트가 아니다.
- 개발 서버를 종료한 뒤 production build의 별도 프로세스로 같은 임시 DB를 열었다. 로그인 후 접수 3개, 동일 접수번호·줄바꿈 메모·09:00–17:00 일정·내부 메모가 유지됨을 브라우저에서 확인했다. production 화면 콘솔 경고·오류 없음. 로그아웃 후 문의 내용이 사라지고 로그인 화면으로 돌아갔다.

## 코드 검사와 Google 대체 전송 테스트

- `npm run check`: **통과** — ESLint 경고 0, Next route typegen + TypeScript, Webpack production build. 이후 타입 계약의 sender/quarantine 보강은 다시 타입 검사·해당 lint 통과.
- `npm run test:operations`: **23/23 통과**, 실패·skip 0. Gmail 수집 10개와 운영/Calendar 13개 테스트다. 실제 Google 서버에 요청하지 않는 격리된 테스트다.
- 자동 테스트 범위: idempotency 충돌, Sydney DST의 없는/중복 시간, 같은 Gmail 대화·최신 30개 이력·검토 중 후속 메일의 revision 보존, MIME/HTML·본문 크기·발신/첨부 metadata, 페이지/API 오류·중복·실패 격리, 인증/교차 출처, OAuth 계정/브라우저 state·재사용 거절, Calendar 생성 응답 유실·반복 일정·두 번째 재시도의 충돌 보호·410 누락 삭제 대사·삭제 승인 후 새 이벤트 ID·동기화 중 Calendar 변경 차단·await 이후 revision 경합.
- `npm run integrations:worker -- --once`: Google 미연결 상태에서 종료 코드 0, 읽기/쓰기 0건 확인. 실제 수집 성공으로 판정하지 않는다.
- `npm run setup:local`: `.env.local` 최초 생성과 두 번째 실행의 기존 파일 보존 확인. 파일 권한 `0600`, `.env.local`과 `.local/operations.sqlite` Git 제외 확인. 비밀 값은 출력하지 않았다.
- Node의 `node:sqlite` 실험 기능 경고와 직접 TypeScript 실행 시 module type 감지 경고는 남아 있다. 이번 로컬 검증은 통과했으며 운영 DB/실행 환경의 검증을 대신하지 않는다.

개발 중 발견한 날짜 input 상태 누락, 줄바꿈 입력 거절, Calendar etag/시간 표현/삭제 복구/동시 수정, Gmail 이력 순서·실패 메시지 정지 문제는 수정 후 위 검사로 확인했다. 프로세스 재시작 영속성은 단위 테스트 이름이 아니라 별도 실제 서버 재시작으로 판정했다.

## 실제 Google 검증 대기

회사 OAuth 클라이언트가 아직 없어 실제 동의 화면, Gmail 라벨 목록/실메일 수집, Google Calendar 생성·수정·삭제 왕복은 미실행이다. 대체 전송 테스트 결과를 실제 연결 성공으로 보지 않는다. [28번 설정 순서](../plans/28-gmail-enquiry-calendar-implementation.md)를 마친 뒤 회사 계정으로 확인해야 한다.

Supabase/RLS·비공개 사진 업로드·AI·Resend·운영 HTTPS·상시 worker·고객 수락/확정 예약·Complete 인보이스 발행은 이번 검증에 포함하지 않는다.
