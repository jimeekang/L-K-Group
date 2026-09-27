# L&K Group 웹 서비스 구축 계획

2026년 9월 25일 · 계획 버전 1.0 · 기준 지역 Australia/Sydney · 문서 언어 한국어

L&K Group의 서비스 홈페이지, 온라인 쇼핑몰, ERP·CRM 운영관리 시스템을 구축하기 위한 개발 참조 문서와 로컬 Next.js 앱 저장소다. 기존 분석 자산은 ChatGPT 프로젝트의 대화 3개와 화면 시안 3개다. 2026-09-27 로컬 기본 앱을 생성했으며, DB·클라우드 연결은 회사 승인 대기다.

권장 방향은 **하나의 고객·운영 데이터 기반 위에 서비스 예약과 상품 구매 흐름을 구분하고, 서비스 매출부터 단계적으로 운영을 검증하는 것**이다. 핸디맨·페인팅·캐비넷 페인팅과 터치업 키트·김치는 동일 관리자에서 관리하되, 식품의 배송·위생·재고 정책은 별도로 적용한다. 사용자가 ESN의 의미를 ERP·CRM 중심으로 확정했다.

## 읽는 순서

**현재 착수 순서(2026-09-27): [메인 3일 → Cabinet 약 1주 → Coatly 기반 회사 관리 웹 TODO](docs/plans/15-home-cabinet-admin-todo.md).** 아래 문서들은 전체 사업의 상세 계획이며, 당장 할 일은 이 체크리스트를 먼저 따른다.

**이번 작업: Day 2 메인 프로토타입.** 로컬 Next.js 프로젝트와 메인 프로토타입을 만들고 코드 검사·실제 브라우저 검증을 마쳤다. Vercel·Supabase는 회사 이메일 승인 후 연결한다. 서비스명은 **Kitchen Cabinet Painting**이다. 순서는 지침 업데이트 → 프로젝트 생성 → 프로토타입 → 디자인 계획·검토 → 디자인 적용이다. [실행 명세](docs/plans/17-home-prototype-design-plan.md)의 디자인 초안은 사용자 검토 대기이며 최종 디자인은 아직 적용하지 않았다.

## 로컬 앱 실행

Node.js 24와 npm 11을 사용한다. `.nvmrc`는 확인한 로컬 버전을 기록하며 실제 패키지 버전은 `package.json`과 lockfile이 기준이다.

```sh
npm ci
npm run dev
```

로컬 주소는 `http://127.0.0.1:3000`이다. 현재 앱은 외부 계정·DB 키 없이 실행되며 색인은 비활성화돼 있다. 검사 명령은 `npm run lint`, `npm run typecheck`, `npm run build`이며 `npm run check`로 순서대로 실행할 수도 있다. CI 설정은 추가했지만 GitHub에서 실행한 결과와는 구분한다.

현재 Mac에서 Turbopack의 CSS worker 포트 권한 오류를 확인해 공식 Webpack 옵션으로 dev·build를 구성했다. Webpack production 빌드는 통과했다. Next.js 공식 ESLint preset의 peer 호환 범위에 맞춰 ESLint 9를 고정했으며 npm의 지원 종료 경고는 남아 있다. 자세한 결과는 [검증 기록](docs/verification/2026-09-27-home-prototype.md)을 따른다.

생성된 임시 로고·사진의 경로·교체 기준과 프롬프트는 [자산 기록](docs/prototype-assets.md)에 있다. 최종 디자인·회사 연락처·운영 도메인은 별도 검토한다.


| 문서 | 개발에서 참조할 내용 |
| --- | --- |
| [00 기존 프로젝트 분석](docs/plans/00-project-baseline.md) | 확인된 시안, 기존 결정, 새 요청과의 차이 |
| [01 사업 목표와 범위](docs/plans/01-product-scope.md) | 단계별 범위, 이용자, 요구사항 ID |
| [02 화면과 고객 여정](docs/plans/02-information-architecture.md) | 사이트맵, 페이지 구성, 모바일 흐름 |
| [03 기술 구조와 배포](docs/plans/03-architecture-and-deployment.md) | Next.js, Supabase, Vercel, Docker 역할 |
| [04 데이터와 권한](docs/plans/04-data-model-and-access.md) | 테이블, 상태, 원장, 데이터 접근 |
| [05 자동견적과 예약](docs/plans/05-quote-ai-booking.md) | 정찰제, 사진 분석, 승인, 일정, 변경견적 |
| [06 쇼핑몰과 재고](docs/plans/06-commerce-and-inventory.md) | 키트, 김치, 결제, 배송, 반품 |
| [07 자동화와 운영](docs/plans/07-automation-and-operations.md) | 이메일, 인보이스, 장애 복구, 관리자 SOP |
| [08 보안과 호주 운영 조건](docs/plans/08-security-and-compliance.md) | 고객 사진, 개인정보, 계약, 식품 판매 조건 |
| [09 테스트와 출시 검증](docs/plans/09-test-and-qa.md) | 테스트 시나리오, AI 평가, UAT, 출시 기준 |
| [10 일정과 비용](docs/plans/10-roadmap-budget-risks.md) | 인력, 의존성, 공수, 운영비, 위험 |
| [11 서비스 마케팅](docs/plans/11-marketing-and-growth.md) | 고객군, SEO, 광고, 콘텐츠, 90일 실행 |
| [12 개발 백로그](docs/plans/12-implementation-backlog.md) | 구현 순서, 완료 기준, 담당 역할 |
| [13 모델과 개발 운영](docs/plans/13-ai-development-workflow.md) | Astra xhigh / Sol xhigh 작업 기준 |
| [14 결정과 출처](docs/plans/14-decisions-and-sources.md) | 확정·제안·미정 구분과 공식 근거 |
| [15 우선 제작 TODO](docs/plans/15-home-cabinet-admin-todo.md) | 메인·Cabinet·관리 웹의 착수 순서 |
| [17 메인 프로토타입·디자인](docs/plans/17-home-prototype-design-plan.md) | 구현 범위, DDD 조립, 디자인 초안, SEO·QA 기준 |

클라이언트 전달본은 [Word 구현계획서](deliverables/LK_Group_Client_Implementation_Plan_KO.docx)이며, 편집 가능한 원문은 [클라이언트 제안서 Markdown](docs/client-proposal.md)이다. 기술 기준은 위 개발 문서가 원본이며, 클라이언트 문서를 변경할 때 관련 개발 문서도 함께 갱신한다. 문서 자체의 확인 결과는 [검증 기록](docs/document-validation.md)에 정리했다.


## 계획의 사용 기준

- 일정·가격·전환율은 사업 자료가 없는 상태에서 세운 **계획 가정**이다. 승인된 계약금액, 견적 단가 또는 실적이 아니다.
- 고객용 영어 사이트를 우선하고 한국어 콘텐츠를 다음 단계에서 추가하는 안이다. 브랜드명과 법인·ABN·GST 등록 상태는 착수 단계에서 확인한다.
- 고객 서비스 지역은 기존 요청을 따라 Ermington 기준 15km 반경을 기본안으로 둔다. 중심 좌표, 경계값 포함 여부, 도로거리 전환 여부는 결정표에서 확정한다.
- 실제 서비스 판매가격은 비워 두고, 산식 설명용 가격은 모두 예시로 표시한다.
- 기존 산출물은 계획서와 작업 설정이며, 2026-09-27 로컬 Next.js 메인 프로토타입 개발 요청이 추가됐다. 앱 배포·DB 연결은 회사 승인 후 진행하고 결제 계정 개설·광고 집행은 이번 범위에 포함하지 않는다.

## 첫 착수 회의 산출물

대표가 승인할 항목은 판매 사업자와 서비스 자격, 초기 서비스 목록, 정찰제 포함 범위, 서비스 중심 주소, 키트 SKU, 김치 제조·배송 방법, 목표 예산, 출시 담당자다. 이 자료를 [결정표](docs/plans/14-decisions-and-sources.md)에 기록하면 개발 백로그의 준비 단계부터 시작할 수 있다.

## 다른 기기에서 작업 이어가기

저장소는 [jimeekang/L-K-Group](https://github.com/jimeekang/L-K-Group)이다. 새 기기에서 `git clone https://github.com/jimeekang/L-K-Group.git`으로 내려받고 해당 폴더를 Codex 프로젝트로 연다. 작업 시작 전 `git pull --ff-only`, 종료 후 커밋과 `git push`로 변경 사항을 주고받는다.

맥북 최초 설정, GitHub 인증, 기기를 바꿀 때의 순서와 문서 도구의 실행 조건은 [다른 기기에서 작업 이어가기](docs/device-setup.md)를 참조한다.
