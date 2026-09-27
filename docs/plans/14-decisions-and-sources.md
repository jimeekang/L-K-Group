# 결정 기록과 근거 자료

## 확정과 제안 구분

| ID | 항목 | 현재 기준 | 상태·결정자·확정 시점 |
| --- | --- | --- | --- |
| D01 | 사업 구성 | 핸디맨·페인팅·캐비넷 페인팅·터치업 키트·김치 | 사용자 확정 2026-09-25 |
| D02 | 작업 지역 | Ermington 반경 15km, 기준 좌표와 15,000m 포함은 확정 필요 | 기본안 직선 ≤15km / 대표·준비 단계 |
| D03 | ESN 의미 | ERP·CRM 주문·재고·견적·고객 중심 | 사용자 답변 확정 2026-09-25 |
| D04 | 기술 | Next.js·Supabase Cloud·Vercel로 시작, Docker는 로컬 DB 실행·검증이 필요할 때 선택 사용 | 기본 기술 사용자 확정; Docker 선택 사용은 사용자 확정 2026-09-27 |
| D05 | 김치 운영 | 제조 주체·장소·승인·배치·기한·배송 지역 | 미정 / 식품 책임자·C 구현 전 |
| D06 | 판매 법인·ABN·GST·계좌·자격·보험 | 증빙 확인 후 서비스·청구 활성화 | 미정 / 대표·회계·준비 단계 |
| D07 | 초기 제작 순서 | 메인 → Cabinet Painting → 회사 관리 웹, 이후 나머지 사업 확장 | 사용자 지정 2026-09-27; 세부 범위는 실행 TODO 제안 |
| D08 | 정찰제 | 포함 범위·단위·시간·원가·추가금 표 | 미정 / 대표·운영·A 견적 구현 전 |
| D09 | AI 권한 | 승인 가격표 매핑, 초기 사람 검토, 평가 후 제한 자동화 | 제안 / 대표·QA·C 활성화 전 |
| D10 | 예약금·취소·유효기간 | 계약유형별 예약금, 견적 14일 기본안 | 제안·법적 조건 확인 / 대표·회계 |
| D11 | 키트 SKU | 시안 4종 후보, 30·50병 등 구성 미확정 | 미정 / 상품 담당·B 전 |
| D12 | 결제·청구 | Stripe, 앱 인보이스 기본안, 회계 연동 원본 결정 | 제안 / 회계·A 결제 구현 전 |
| D13 | 영어·한국어 | 영어 우선, C에서 핵심 한국어 | 제안 / 대표·콘텐츠 |
| D14 | 혼합 장바구니 | 키트와 김치 별도 결제, 고객 계정 통합 | 제안 / 대표·B 설계 전 |
| D15 | 도메인·브랜드 | 하나의 초기 도메인, 식품 전용 화면 | 소유·명칭 미정 / 대표·준비 단계 |
| D16 | 일정·예산 | 메인 목표 3일, Cabinet 목표 약 1주; 관리 웹은 별도 산정. 전체 확장 18~24주·850~1,270h와 예산은 기존 추정 | 초기 목표는 사용자 지정 2026-09-27; 전체 공수·예산은 미승인 가정 |
| D17 | 복구 목표 | RPO 1시간·RTO 4시간, 옵션·시험 필요 | 제안 / 대표·기술·A 출시 전 |
| D18 | 모델 운영 | Astra xhigh 계획·디자인·DB·분석·테스트·QA, Sol xhigh 코드·단순 Git 관리 | 사용자 갱신 2026-09-27; 기존 Sol high 대체, 설정 저장과 실제 실행 구분 |
| D19 | 회사 관리 웹 재사용 | Coatly에 만든 기능을 대부분 재사용하는 방향 | 사용자 지정 2026-09-27; 실제 재사용 가능 범위·수정량은 구현 전 확인 |
| D27 | 현재 착수 | Day 2 메인 화면 우선, 필요한 Day 1 로컬 설정만 선행 | 사용자 지정 2026-09-27 |
| D28 | 계정 연결 | Vercel·Supabase는 회사 이메일·승인 후 해당 회사 계정으로 연결 | 사용자 지정 2026-09-27; 현재 승인 대기 |
| D29 | 개발 구조 | Next.js + TypeScript, 업무별 DDD 모듈, 공개 진입점을 통한 재사용·조립 | 사용자 지정 2026-09-27 |
| D30 | 이번 순서 | 지침 → 프로젝트 생성 → 메인 프로토타입 → 디자인 계획·검토 → 적용 | 사용자 지정 2026-09-27 |
| D31 | 이미지·로고 | 임시 생성 자산을 사용하고 실제 자료가 오면 교체, 실제 실적과 구분 | 생성·교체는 사용자 요청; 표시 기준은 진실성 원칙 |
| D32 | 메인 서비스명 | Kitchen Cabinet Painting | 사용자 정정 2026-09-27; 기존 캐비넷 도장 |
| D33 | 디자인 방향 | 따뜻한 화이트·차콜·유칼립투스 그린, 호주 주거 공간·마감 중심 | 제안; 프로토타입 검토 후 사용자 확인 |
| D34 | 서브에이전트 모델 | 메인과 동일한 업무별 Astra xhigh / Sol xhigh. 기존 5.6-sol high 고정 규칙 폐기 | 사용자 후속 지시 2026-09-27; 구현 분업에 적용 |

현재 실행 체크리스트는 [메인 → Cabinet → 회사 관리 웹 TODO](15-home-cabinet-admin-todo.md)다. Cabinet 첫 버전을 문의 접수 중심으로 만들고 자동예약·결제를 뒤에 연결하는 세부 범위는 이번 일정에 맞춘 제안이다.


계획 작성은 위 미정 사항을 제안과 조건으로 표시한 상태에서 완료한다. 결제·가격·식품 등 의존 기능의 실제 출시 전에는 해당 결정이 필요하다. 이후 결정 변경은 날짜·이유·영향 문서·추가 공수와 함께 기록한다.

## 공식 기술 자료

모든 링크는 2026년 9월 25일 조사 기준이다. 게시 내용과 가격은 구현·가입·출시 시 다시 확인한다. 과거 대화에 있는 AI 답변이나 이미지 시안은 현재 공급자 기능의 공식 근거로 사용하지 않는다.

| ID | 출처 | 계획에서 사용하는 근거 |
| --- | --- | --- |
| S01 | [Next.js 배포](https://nextjs.org/docs/app/getting-started/deploying) | 관리형·자체 배포 방법 |
| S02 | [Supabase 변경 기록](https://supabase.com/changelog.md) | 현재 변경 검토; logs.all 이전 등 구현 시 주의 |
| S03 | [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) | DB 권한·GRANT·행 접근 보호 |
| S04 | [Supabase 백업](https://supabase.com/docs/guides/platform/backups) | DB와 Storage 객체 복구 구분 |
| S05 | [Vercel Docker 배포](https://vercel.com/kb/guide/does-vercel-support-docker-deployments) | OCI 이미지 지원, 함수 실행 모델 |
| S06 | [Vercel Docker Compose](https://vercel.com/i/can-you-run-docker-compose-on-vercel) | 로컬 Compose와 운영 배포 구분 |
| S07 | [Stripe Webhook](https://docs.stripe.com/webhooks) | 서명·중복·역순 이벤트 처리 |
| S08 | [Google Geocoding 정책](https://developers.google.com/maps/documentation/geocoding/policies) | 주소 결과의 저장·표시 조건 |
| S09 | [Google Routes 정책](https://developers.google.com/maps/documentation/routes/policies) | 도로거리 결과의 이용 조건 |
| S10 | [Supabase 가격](https://supabase.com/pricing) | Pro·추가 프로젝트·PITR 비용 확인 |
| S11 | [Vercel 가격](https://vercel.com/pricing) | Pro·좌석·사용량 비용 |
| S12 | [Stripe AU 가격](https://stripe.com/au/pricing) | 결제 수수료와 예정 요금 변경 주석 |
| S13 | [Codex 설정 참조](https://learn.chatgpt.com/docs/config-file/config-reference) | model·model_reasoning_effort |
| S14 | [Codex 고급 설정](https://learn.chatgpt.com/docs/config-file/config-advanced) | 현재 프로필 파일 방식 |

## 호주 사업과 마케팅 자료

| ID | 출처 | 반영 항목 |
| --- | --- | --- |
| S15 | [NSW Painting work](https://www.nsw.gov.au/business-and-economy/licences-and-credentials/building-and-trade-licences-and-registrations/painting-work) | 페인팅 자격 검토 |
| S16 | [NSW 주거공사 계약](https://www.nsw.gov.au/housing-and-construction/building-or-renovating-a-home/preparing/contracts) | 계약·예약금·작업 조건 |
| S17 | [NSW 식품 사업 시작](https://www.foodauthority.nsw.gov.au/industry/starting-a-food-business) | 제조·판매 형태별 절차 |
| S18 | [가정 기반 식품 사업](https://www.foodauthority.nsw.gov.au/retail/home-based-mixed-businesses) | council·Food Authority 및 식품 표시 |
| S19 | [FSANZ 식품 표시](https://www.foodstandards.gov.au/business/labelling) | 라벨·설명·표시 검토 |
| S20 | [FSANZ 알레르겐](https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling) | 알레르겐 명시 |
| S21 | [ATO GST 회계](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/accounting-for-gst-in-your-business) | GST·회계 연결 검토 |
| S22 | [ATO Tax invoices 자료](https://www.ato.gov.au/api/public/content/0-1e92db95-a75c-4f4e-a3d4-39f43b1a3b25) | 인보이스 필수 정보 |
| S23 | [OAIC 소규모 사업](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/small-business) | 개인정보법 적용 범위 검토 |
| S24 | [ACMA 스팸 방지](https://www.acma.gov.au/avoid-sending-spam) | 수신동의·철회·발신자 표시 |
| S25 | [ACCC 가격 표시](https://www.accc.gov.au/business/pricing/price-displays) | 소비자 총가격·추가 비용 |
| S26 | [ACCC 소비자 보장](https://www.accc.gov.au/consumers/buying-products-and-services/consumer-rights-and-guarantees) | 반품·결함·서비스 보장 |
| S27 | [Google Business Profile 지침](https://support.google.com/business/answer/3038177?hl=en) | 실제 사업과 서비스 지역의 프로필 |
| S28 | [Google 검색 스팸 정책](https://developers.google.com/search/docs/essentials/spam-policies) | 지역명 복제 페이지·허위 콘텐츠 방지 |
| S29 | [Jim's Handyman Sydney](https://jimshandyman.com.au/locations/new-south-wales/sydney-handyman/) | 서비스 랜딩 참고, 성과 추정 없음 |
| S30 | [Kimchi Club 배송](https://kimchiclub.com.au/shipping-information/) | 제한된 식품 배송 안내 참고 |

## 구현 시 다시 확인할 변경 사항

Supabase 변경 기록에서 관리 API logs.all 제거, 자체 호스팅 게이트웨이 변경, realtime 스키마 수정 제한 등을 확인했다. 이번에는 API 호출이나 자체 호스팅을 구현하지 않으므로 해당 변경을 적용했다고 기록하지 않는다. 실제 구현에서는 사용하는 기능의 최신 문서를 다시 확인한다.

외부 데이터 출처의 가격·법적 조건과 이 문서의 자체 공수·마케팅 가설을 섞지 않는다. 견적 산식 예제, A$100~140 시간당 가정, 전환율·광고 예산은 프로젝트 계획자가 산정한 예시다.
