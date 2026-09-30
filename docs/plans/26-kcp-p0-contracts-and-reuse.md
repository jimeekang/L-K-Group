# KCP P0 — 입력·상태·데이터 계약과 Coatly 재사용 검토

2026-09-30 · P0 설계 산출물 · [전체 계획](25-kcp-quote-to-booking-implementation.md) · [TODO](15-home-cabinet-admin-todo.md) · [Google Calendar 상세 명세](27-kcp-google-calendar-sync.md)

**후속 구현 요청:** 아래는 P0 당시의 설계·검토 기록이다. 이후 사용자가 기능 우선 구현과 Gmail 문의 메일 자동 수집→Calendar 연결을 요청했다. 현재 실행 범위·실제 완료 수준은 [28번](28-gmail-enquiry-calendar-implementation.md)과 TODO를 따른다. AI·Resend·정찰제·청구 실행은 후속 단계다.

## 1. 확정된 범위와 이번 결과

- 사용자는 **P0만 먼저 진행**하도록 요청했다. P1 화면 구현, DB migration, 계정 연결, 실제 사진/AI 호출·메일·예약·인보이스 생성은 이번 작업에 포함하지 않는다.
- 예약 날짜·시간·기간과 인보이스 관련 날짜는 **Google Calendar에 자동 표시·갱신**한다. Google에서 수정한 일정도 앱에 가져오는 **양방향 연동, 검증 후 확정**을 사용자가 선택했다.
- 회사 연동 계정은 **Lnkgroupsydney@gmail.com**. 마지막 작업 후 사용자의 **프로젝트 Complete → 최종 인보이스 발행 → 실제 발행일 + 3 달력일 납기(Sydney)**로 명세한다. 근무시간·기간 계산은 보류, 정찰제는 가격 자료 수령 후 진행한다. 세부 처리와 달력일 해석은 27번을 따른다.
- 이번에는 Coatly의 실제 코드·migration·테스트 소스를 읽고 재사용/수정 경계를 정했다. 앱 실행·테스트 실행·원격 DB 권한·Google 실연동은 확인하지 않았다. 이 문서의 상태 계약과 필드 기본안은 P1 구현에 사용할 설계이며 회사 가격·운영 정책 승인은 별도다.
- 기존 ‘외부 캘린더 별도 범위’는 이번 요청으로 대체한다. Google은 운영 일정 화면·수정 채널이고, 수락된 견적·자원 예약·인보이스·입금의 기록은 앱 DB에 보존한다.

## 2. Coatly 정적 검토와 재사용 판정

검토 경로: `/Users/jimee/Desktop/Project/Coatly`. 조회한 HEAD는 `9844e3c`(2026-07-23)이며 문서·설정 등에 기존 미커밋 변경이 있다. 아래 판정은 **2026-09-30 작업 디렉터리의 확인한 소스** 기준이다. Coatly 파일·계정·DB를 변경하지 않았으며 배포 버전과 같다고 주장하지 않는다. 소유자 중심 SaaS를 회사 직원·고객 역할이 있는 L&K에 그대로 복사하지 않는다.

| 대상 | 소스에서 확인한 것 | L&K 판정·필요 변경 |
| --- | --- | --- |
| 고객·주소 | `modules/customers/application/actions.ts`에 복수 연락처·현장/청구 주소, `user_id` 범위와 구독 검사 | 폼·검증 패턴 재사용 후보. 구독 제한 제거, 회사 membership·고객 소유 확인·현장 주소 스냅샷으로 변경 |
| 가격·견적 | `modules/quotes/domain/quote-calculations.ts`에 센트 계산·기본 단가·세금 가정, `infrastructure/quote-repository.ts`에 `pricing_snapshot` | 계산 인터페이스/테스트 접근 재사용. 기본 단가·GST 가정은 가져오지 않고 승인 Cabinet 가격표·중복 보수 규칙 신설 |
| 견적 수락 | `modules/quotes/application/public-quote-response-service.ts`는 공개 토큰으로 현재 `quotes` 행을 읽고 승인 필드를 update | 그대로 이식 불가. 소유 확인·불변 `quote_versions`·수락 hash·조건부 버전 변경·경합 처리가 필요 |
| 일정 | `modules/jobs/application/actions.ts`와 migration 037에 날짜별 `job_schedule_days`, 기간·겹침 검사 | 다일 UI/계산 아이디어 재사용. 시간 구간·팀/부스 자원·hold·원자적 충돌 제약·희망일/확정 구분을 새 계약으로 확장 |
| Google OAuth | `modules/schedule/infrastructure/google-calendar/oauth.ts`, `crypto.ts`, API connect/callback과 migration 035 | OAuth·암호화 패턴 재사용 후보. 기존 앱 client ID fallback 제거, 회사 설정 필수, 서버 전용 토큰·권한 재검토. 회사 관리자 로그인과 Google 연결 자격을 분리 |
| Google 읽기·쓰기 | `service.ts`에 목록/FreeBusy·event POST/PATCH/DELETE·sync status, `job-calendar-sync.ts`가 작업 연결 | API 어댑터 참고. 현재 종일 작업·날짜 차단 중심이므로 시간별 점유·복수 구간·청구 이벤트·증분 동기화·충돌 처리를 추가 |
| 인보이스 | `modules/invoices/domain/invoice.ts`와 `application/actions.ts`에 full/deposit/progress/final, due/paid 날짜·입금액·견적 연결 | PDF·폼·품목 구조 재사용 후보. 발행 예정/실제 발행 분리, 독립 입금 원장·부분입금·예약금 배분·자동 일정 규칙 신설 |
| 원자성·권한 | migration 040에 invoice update RPC, 046~049에 RPC 권한 변경; 대부분 소유자 `auth.uid()` | RPC 패턴 참고. DB 현재 적용 여부는 미검증. 직원 역할·고객 조회·민감 토큰 비공개·기업 범위 제약을 다시 작성 |
| PDF·메일 | 견적/인보이스 PDF와 발송 서비스·invoice reminder route 존재 | 템플릿/어댑터 후보. 실제 운영값·Coatly 브랜드·SaaS 결제 제거, L&K 승인 템플릿·outbox·재시도에 연결 |

### 그대로 가져오면 안 되는 확인 사항

| ID | 확인한 소스 근거 | 이식 전 조치 |
| --- | --- | --- |
| CR01 | `service.ts:599`는 시간별 busy도 날짜 전체 차단으로 변환, `:748`은 작업을 `start.date/end.date` 종일 이벤트로 전송 | 작업 세그먼트별 `dateTime`과 종일 요약 분리. 1시간 일정 때문에 하루 전체를 막지 않음 |
| CR02 | `jobs/application/actions.ts:1480`은 Google 동기화 반환값을 판정하지 않고 마지막에 성공 반환 | DB 저장·Google 반영·예약 최종 확정을 분리. Google 실패 시 `sync_pending/review_required`, 무조건 확정 표시 금지 |
| CR03 | `service.ts:625` 계열의 access 실패는 빈 blockedDates·오류 없음으로 반환하는 경로가 있음 | 미연결/권한 회수/조회 실패를 ‘가용’과 구분. 필수 Calendar 미확인 시 자동 확정 보류 |
| CR04 | `jobs/application/actions.ts:1403` 겹침 조회 후 `:1449` 별도 insert. 조회 RPC는 `exists` 검사 | 조회 후 쓰기만으로 동시 예약 안전성을 가정하지 않음. DB 제약/잠금·idempotency·외부 재검사 설계 |
| CR05 | `service.ts:555` 이벤트 목록은 items만 사용; 조사한 Calendar 경로에 syncToken/watch/If-Match 구현 없음 | 전체 페이지 처리, 삭제/반복 예외, push+증분 조회, etag 경합·재대사 추가 |
| CR06 | `public-quote-response-service.ts:87`은 동일 견적 행에 승인 정보 갱신 | 발행/수락 버전 보존, 변경견적·명시적 재수락. 이메일에 적힌 이름만으로 소유 인증하지 않음 |
| CR07 | `invoices/application/actions.ts:691`의 createInvoice는 번호 생성·헤더·품목·합계를 분리 호출하고 실패 시 보상 삭제 | 생성·품목·입금 연결·outbox는 트랜잭션. 발행 후 수정·금액 대사 규칙 적용 |
| CR08 | 확인한 Invoice 타입은 due_date/paid_date/created_at 중심이며 Calendar 청구 이벤트 연결 없음 | `planned_issue_on`, `issued_on`, `due_on`, 실제 `paid_at` 구분과 캘린더 이벤트 mapping 신설 |
| CR09 | Google service 테스트 2개는 날짜 확장, OAuth/crypto 테스트는 자격·암호화 중심. jobs 테스트는 mock busy·예약 후 sync 호출 등을 다룸 | 실제 OAuth·쓰기 실패·중복 이벤트·양방향·시간 구간·원자성 통과 증거로 사용하지 않음 |

근거 링크: [Google service](</Users/jimee/Desktop/Project/Coatly/modules/schedule/infrastructure/google-calendar/service.ts>), [예약 액션](</Users/jimee/Desktop/Project/Coatly/modules/jobs/application/actions.ts>), [견적 수락](</Users/jimee/Desktop/Project/Coatly/modules/quotes/application/public-quote-response-service.ts>), [인보이스 액션](</Users/jimee/Desktop/Project/Coatly/modules/invoices/application/actions.ts>), [Calendar migration](</Users/jimee/Desktop/Project/Coatly/supabase/migrations/035_google_calendar_integration.sql>), [기존 출시 미해결 기록](</Users/jimee/Desktop/Project/Coatly/docs/LAUNCH-READINESS.md>). 절대 경로는 이 기기의 검토 근거이며 다른 기기에서는 Coatly 체크아웃 경로를 대입한다.

## 3. 고객 입력 계약 — P1 기본안

실제 운영의 수집·보관 안내는 회사 확인 후 확정한다. 아래는 로컬 프로토타입과 검증 스키마의 기본안이다. 필수값이 없는 경우 가격·예약 확정 가능 여부를 명시하고 입력을 임의로 보충하지 않는다.

| 단계·필드 | 필수/허용값 | 검증·다음 단계 |
| --- | --- | --- |
| `service_id` | KCP 고정 | URL은 기본 선택일 뿐 서버 허용 ID 검증 |
| `project_intent` | 전체 도장 / 부분 터치업 / 색상 변경 / 상담 필요 중 1개 | 가격 패키지 ID와 분리 |
| `target_surfaces[]` | 문·서랍 전면·프레임·패널·보수 대상 또는 모름 | 중복 제거, 목적과 대상에 이중 과금 금지 |
| `suburb`, `postcode` | 최초 지역 단계 필수 | NSW 형식 검증과 실제 서비스 가능 판정 구분. 불확실하면 검토 |
| `door_count`, `drawer_count` | 0 이상 정수 또는 모름 | 음수·소수 금지. 모름/0만으로 전체 가격 확정 불가 |
| `material`, `colour_preference`, `notes` | 선택, 재질 모름 허용 | 길이 제한·출력 escape, 자격/가격 결정 명령으로 해석하지 않음 |
| `photos[]` | AI는 유효 이미지 1장 이상; 사진 없이 담당자 경로 가능 | 전체·표면·손상 촬영 권장. P1 테스트 한도 8장/10MB·총80MB는 임시 검증값이며 P2 운영 제한은 별도 확정 |
| `processing_notice_version` | 업로드/AI 전 안내 확인 필요 | 사용 목적·외부 AI 처리 고지, 시각·문구 버전 기록. 마케팅 동의와 분리 |
| `selected_scope[]` | 가격 단계에서 선택 또는 담당자 상담 | 서버의 활성 가격표 규칙만 계산. 임의 금액·AI 자유 금액 불허 |
| `name`, `email` | 최종 제출 필수 | 공백/형식 확인. 이메일 인증 전 과거 고객 자료·확정견적 접근 금지 |
| `phone` | 선택 기본안 | 입력 시 국제/호주 번호 정규화; 필수화 여부 회사 확인 |
| `site_address` | 희망일의 자동 가용성/최종 예약 전에 필수 | 주소 검토 중에도 문의 접수 가능, 자동 확정은 불가 |
| `preferred_date`, `preferred_window` | 희망 날짜 또는 미정, 선호 시간대 선택 | 시간대는 승인 영업 규칙이 생긴 뒤 제공. 작업 기간·시작 시각 미정이면 후보 요청으로 저장 |
| `submission_confirmation` | 최종 제출 전 필수 | 입력 요약과 ‘요청이며 예약 확정 아님’ 안내, 중복 제출 방지 |

레이아웃: `/quote/start?service=cabinet-painting`의 ①서비스·지역 ②사진·작업정보 ③AI 결과 ④범위·예상견적 ⑤희망일·연락처 ⑥제출 확인. 헤더·Hero·하단은 같은 흐름으로 진입한다. 사진 CTA는 새 초안을 중복 생성하지 않고 같은 초안의 업로드 단계로 이동하며 빠진 필드를 보완한다.

화면 상태: `editing / validating / uploading / analysing / needs_info / review_required / saving / submitted / retryable_error / expired`. 필드 오류는 해당 입력과 요약에 연결하고 첫 오류로 포커스를 옮긴다. 이전 단계에서 변경하면 그 입력에 의존하는 분석·가격·가용성 결과를 무효화한다. 대기·실패 화면에서 기존 입력을 보존한다. 서버 저장 전 로컬 상태를 저장 완료로 표시하지 않는다.

## 4. 업무 상태와 불변 조건

| 객체 | 기본 상태 | 허용 전이·제약 |
| --- | --- | --- |
| 초안 | editing → submitted / expired | 익명 작성 권한은 이 초안만. 동일 세션 재개, 다른 세션은 소유 확인 |
| 사진 | pending_upload → uploaded → validated → attached / rejected | 실제 검사 후 분석 가능. 타인 키 연결 불가, 만료 초안 고아 파일 정리 |
| AI | queued → running → succeeded / needs_review / failed | 입력 revision·사진 hash가 현재 초안과 같을 때만 적용. 요청 재시도 중복 방지 |
| 문의 | submitted → reviewing → quoted → closed | needs_info·out_of_area_review·spam 별도. 메일/AI 실패는 문의 삭제 사유 아님 |
| 견적 버전 | draft → approved → sent → accepted | rejected·expired·superseded. 승인 주체와 고객 수락 구분, accepted 내용 불변 |
| 예약 요청 | requested → reviewing → proposed → converted | 시간/기간/자원·주소·견적 요건이 충족돼야 확정 예약으로 연결 |
| 예약 | held → confirming → confirmed → completed | payment_pending·sync_pending·change_pending·cancelled·review_required. 업체 정책·Google 상태·최종 자원 확보 검사 |
| 캘린더 변경 | received → validated → applied / awaiting_consent / conflict / rejected | 중복 사건·오래된 etag/revision 무해 처리. 확정 고객 약속 변경은 재동의 |
| 프로젝트 완료 | in_progress → completed | 소유자 권한 사용자의 프로젝트 Complete, 필수 작업 완료·revision 검사. completed_at·행위자·outbox 보존, 청구 보류와 별도 |
| 청구 계획 | planned → ready → issued / cancelled | Complete 이후 발행 조건 검사. 정보 부족은 billing_blocked, 날짜 도래·개별 작업 완료만으로 발행하지 않음 |
| 인보이스/입금 | draft → issued → partially_paid → paid | 취소/크레딧/환불은 원거래 연결. Google의 이동·제목 변경·삭제는 입금/발행 증거가 아님 |

서버 계산값·견적 버전·변경 전 revision·idempotency key를 사용한다. 요청 저장과 outbox는 동일 DB 트랜잭션, 외부 API는 그 밖에서 처리한다. 자원 점유는 `[start_at, end_at)` 구간이며 만료 hold 정리와 새 점유를 함께 검사한다. 유효 견적 수락과 실제 날짜 확보는 별개다. Google과 DB 간 단일 트랜잭션은 없으므로 동기화 대기·재검사·보상·대사를 명시한다.

## 5. 데이터·모듈·권한 계약

| 업무 모듈 | 주요 데이터·공개 사용 사례 | 제약 |
| --- | --- | --- |
| `enquiries` | drafts·uploads·enquiries, CreateDraft/FinalizeUpload/SubmitEnquiry | 초안 revision, 업로드 소유, `(scope,idempotency_key)` 유일 + payload hash |
| `customers` | customers·auth_links·addresses·consents, VerifyCustomer/ReadOwnRecords | 이메일만으로 자동 병합 금지, 동의 버전·철회·자료 삭제 이력 |
| `assessments` | assessments·observations, RequestAssessment/GetAssessment | draft+input hash+모델/프롬프트/스키마 버전, 활성 결과 1개 |
| `quotes` | price_books·quote_versions·lines·acceptances, Calculate/Approve/AcceptQuote | quote+version 유일, 가격표/세금/조건 snapshot·수락 hash |
| `bookings` | requests·resources·work_segments·holds·bookings·projects·completion_records·change_requests | 자원별 중복 금지·다일/부스 점유, 프로젝트에 모든 작업 연결, Complete 권한·version·완료 감사 |
| `billing` | invoice_plans·invoices·payment_allocations·refunds | 번호·회사/프로젝트 최종 인보이스 유일, 완료 사건 참조, issued_on+3 달력일, 실제 발행/입금 기록·금액/잔액 일치 |
| `calendar-sync` | connections·calendar_bindings·event_links·sync_cursors·channels·change_requests | CalendarPort를 통한 읽기/쓰기, 직원 ACL·서버 전용 credential, outbox/중복/충돌 |

외부 Calendar 명령은 `CalendarPort.upsertManagedEvent/deleteManagedEvent/pullChanges/readBusy`로 추상화한다. `calendar-sync`가 회사 캘린더 mapping과 공급자 어댑터를 소유하며 bookings/billing은 업무 사건과 projection payload를 전달한다. 도메인과 application은 Google·Supabase 구체 클라이언트를 import하지 않는다. Coatly의 application→infrastructure 직접 참조는 그대로 이식하지 않는다. `src/app`은 조립만 맡고 각 모듈은 `index.ts`로 공개한다.

권한: 익명은 제한된 자기 초안 작성/업로드만, 인증 고객은 연결된 자기 문의·견적·예약·청구만, 직원은 membership/배정 범위의 운영 업무만, 회계는 청구·입금, 회사 관리자는 캘린더 연결/역할 설정을 수행한다. OAuth credential과 sync worker 상태는 서버 전용 스키마/권한에 두고 브라우저 SELECT를 허용하지 않는다. 직원 JWT·user_metadata만으로 최신 업무 권한을 결정하지 않는다. 개인정보/토큰/사진 URL을 공용 캐시·로그·분석 도구에 보내지 않는다.

## 6. API 계약 초안

경로는 구현 계약 초안이다. 실제 Next.js 핸들러·DB 함수는 이후 작성한다. 공통 오류 형식은 `{ code, fieldErrors?, retryable, correlationId }`, 개인정보 없는 상세 안내를 사용한다.

| 명령/조회 | 핵심 입력 → 출력 | 권한·오류 |
| --- | --- | --- |
| `POST /api/enquiry-drafts` | service → draftId/revision·서버 작성 세션 | 요청 제한, 만료; 원시 토큰 응답/로그 최소화 |
| `PATCH /api/enquiry-drafts/{id}` | expectedRevision·필드 → revision | 소유 검사, 409 stale_revision |
| `POST /api/enquiry-drafts/{id}/uploads` | 실제 검사 예정 파일 메타 → 제한된 업로드 권한 | 경로/크기/세션 제한; 타인 경로 불가 |
| `POST /api/uploads/{id}/complete` | 완료 확인 → validated/rejected | 서버 객체 재확인, 검사 전 attached/AI 금지 |
| `POST /api/enquiry-drafts/{id}/assessments` | inputRevision·동의 → jobId/status | idempotency·비용 제한, 202 대기, 실패는 수동 검토 |
| `POST /api/quotes/estimate` | scope·수량·assessmentRevision → 견적안/검토상태 | 서버 승인 규칙만 계산, 가격 미정 코드 |
| `GET /api/availability` | 주소검증 ID·기간 후보·기간 범위 → 가용 후보/검토/유효시점 | 고객에게 다른 일정 정보 제외. 미정 duration은 확정 가용성 반환 금지 |
| `POST /api/enquiries` | draftRevision·연락처·희망일·확인 → enquiryId/requestId | 동일 key+같은 내용이면 같은 결과, 다른 내용 409 |
| `POST /api/admin/booking-proposals` | requestId·segments·resources·quoteVersion → proposalId/revision | 직원 역할, 주소/가격·기간·busy 검사 |
| `POST /api/quotes/{id}/accept` | version/hash·명시 동의 → acceptanceId | 이메일 소유 확인, stale/expired 409, GET 수락 불가 |
| `POST /api/admin/bookings/{id}/confirm` | expectedRevision → confirmed/pending/review | DB 자원 + Google 동기화 + 회사 정책, 무조건 성공 응답 금지 |
| `POST /api/admin/projects/{id}/complete` | expectedRevision·idempotencyKey → completedAt·billingStatus·invoiceId(발행 시) | 소유자 권한·미완료 필수 작업 검사, 409 stale/incomplete, 중복은 기존 결과. 발행 보류/실패 별도 표시 |
| `POST /api/admin/invoice-plans` | projectId·quoteVersion·policyVersion → 예상 날짜/Complete 대기 | 회계 권한, 서버의 Complete/+3 정책 적용. 클라이언트 임의 offset 금지, 발행 조건 미충족 시 보류 |
| Calendar connect/callback/notifications/reconcile | [27번 계약](27-kcp-google-calendar-sync.md) | 회사 관리자·OAuth state·channel 검증; 고객 임의 calendar ID 금지 |

초안 관련 201/202·검토 대기와 접수/예약 확정의 의미를 구분한다. 검토 경로는 문의 저장 성공을 반환할 수 있지만, AI 분석·가격 확정·예약 확정을 성공으로 함께 표시하지 않는다.

## 7. 완료 범위와 남은 결정

P0의 재사용 정적 검토, 입력/상태/API/권한 초안, Google 양방향 자동화 계약과 검증 시나리오를 작성했다. P1 이후 실행은 미착수다. 새 운영 정책을 추정해 적용하지 않도록 아래를 명시적으로 남긴다.

| 항목 | 현재 상태 | 실제 적용 전 필요한 결정 |
| --- | --- | --- |
| Google 연동·양방향 | 사용자 확정, Lnkgroupsydney@gmail.com 지정 | 실제 접근·대상 캘린더·공유/수정 권한·Cloud/OAuth 설정 |
| 시간·기간 자동 산정 | 사용자 보류, 산식 입력 미정 | 근무일/시간·자원 수·부스/건조 구간·buffer·회사 duration 템플릿 |
| 인보이스 날짜 자동 설정 | 최종 작업 후 프로젝트 Complete 발행·실제 발행일 +3 달력일 명세 | 청구 원본·세금/가격·예약금/중도금 정책, 알림·연체 판정 시각. 발행/납기 기준을 다시 미정으로 두지 않음 |
| 고객 입력 | 3절 P1 기본안 | 전화 필수 여부·사진 제한·보관기간·회사 개인정보/AI 안내 |
| 가격·지역·AI | 정찰제는 가격 수령 후, 나머지 미결정 목록 유지 | 승인 Cabinet 가격표·GST/조건, 주소 경계, AI 제공자/비용/평가자료 |
| 연결·공개 | 연동 계정 지정 완료, 실제 연결·공개 미착수 | 지정 회사 계정의 서비스별 접근·설정/비용과 운영 도메인·공개 승인 |

설계 검증은 문서 간 연결·식별자·필수 흐름·근거 경로 확인으로 한정한다. 런타임 검증은 P2~P8 체크에 남겨 두며 Coatly의 기존 테스트 파일이 있다는 사실을 통과 결과로 표시하지 않는다.
