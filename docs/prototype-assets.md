# 회사 제공 자산과 프로토타입 이미지 기록

## 2026-09-27 회사 자산 반영

원본은 중복 정리 후 각 자산의 대표 저장 위치에 보존한다. 로고 PDF와 웹에 사용하지 않는 참고 자료는 [reference-assets](reference-assets/)에, 그대로 복사한 홍보·작업 사진 3개는 아래 `public/images/` 파일에 원본 바이트를 보존한다. [회사 제공 자료](reference-assets/company-brief.md)에 수령 파일명·출처·현재 저장 위치와 미확정 설명을 기록했다. 메인은 아래 실제 회사 제공 자산을 사용하며 사용 중인 생성 이미지는 Cabinet 컨셉으로만 남는다. 웹용 로고는 PDF를 그대로 렌더링했으며 새로운 로고를 생성하거나 도형을 수정하지 않았다.

| 원본 | 웹 파일 | 크기·적용 |
| --- | --- | --- |
| `LK_Group_Logo.pdf` | `public/images/lk-group-logo.png` | 900×900 PNG, 공통 헤더·favicon |
| `L&K main page photo.png` | `public/images/lk-group-promotional-artwork.png` | 1254×1254, 기존 About 영역, 전체 비율 보존 |
| `cabinet progress 2.jpg` | `public/images/cabinet-surface-preparation.jpg` | 1080×2340, 메인 갤러리 표면 보수 |
| `cabinet working 1.jpg` | `public/images/cabinet-door-spray-painting.jpg` | 1080×2340, 메인 갤러리 분사 도장 |

세 사진/홍보 이미지는 원본과 SHA-256이 같은 웹 파일을 유지하고 `reference-assets`의 중복 사본을 삭제했다. 작업 사진은 CSS 4:5 표시 영역을 사용하며 `next/image`가 화면별 크기로 제공한다. 자산 경로·원본 크기·alt·출처는 `src/shared/config/assets.ts`에서 관리한다. 메인 홍보 이미지는 회사 제공 디자인 자료로, 작업 사진은 작업 과정으로 설명하며 완료 현장·지역·날짜·전후 짝을 만들지 않는다. 가격 안내물은 브랜드·세금·현행 적용 조건 확인 전 공개 이미지로 복사하지 않았다.

2026-09-27 사용자 요청으로 중복 4개와 미사용 생성 이미지 2개를 정리했다. 루트 `main page.png`도 SHA-256이 같은 [메인 시안](reference-assets/main-page.png)을 남기고 삭제했다. 삭제한 6개 파일의 합계는 8,382,029바이트이며 사용 중인 웹 이미지·다른 참고 사진·시안·QA 화면은 보존했다.

## 기존 생성 자산 — 최초 프로토타입 기록

2026-09-27 · 내장 `image_gen` 도구로 생성. 최종 브랜드·실제 시공 실적이 아닌 임시 자료다. 현재 사용 중인 두 Cabinet 이미지는 프로젝트 `public/images/`에 보관하며 실제 자료가 오면 콘텐츠의 자산 경로·크기·alt를 함께 교체한다. 회사 자산으로 대체된 워드마크·거실 이미지 파일은 사용자 요청으로 삭제했고 아래 과거 생성 기록과 프롬프트는 보존한다. 사진은 `next/image`로 화면 크기에 맞춰 제공한다.

| 파일 | 크기 | 용도 | 표시 기준 |
| --- | --- | --- | --- |
| `public/images/lk-group-wordmark-concept.png` | 2172×724, 투명 PNG | 과거 헤더 | 회사 로고로 교체, 미사용 확인 후 파일 삭제 완료 |
| `public/images/kitchen-cabinet-concept.png` | 1536×1024 | 캐비넷 컨셉 사진 | 생성된 공간 예시, 실제 프로젝트가 아님 |
| `public/images/living-room-concept.png` | 1536×1024 | 과거 메인 갤러리 | 회사 작업 사진으로 교체, 미사용 확인 후 파일 삭제 완료 |
| `public/images/cabinet-finish-detail-concept.png` | 1536×1024 | KCP 상세의 도장 마감·표면 안내 사진 | 내장 image_gen으로 생성한 컨셉, 실제 시공 실적 아님 |

실제 사진으로 교체할 때 사용 권한·고객 동의와 개인정보 노출 여부를 확인한다. 실제 작업 증거가 확인된 이미지에만 프로젝트 설명을 붙인다. 생성 이미지의 전후 비교를 실제 시공 효과처럼 표시하지 않는다.

## 생성 프롬프트 원문

### 워드마크 — transparent_background=true

Use case: logo-brand. Create a temporary logo asset for a local prototype of an Australian home maintenance and painting company named exactly 'L&K Group'. Minimal confident typographic wordmark, black/charcoal only, contemporary clean bold sans serif, optically spaced, wide horizontal composition about 3:1 with modest clear space. The exact text is 'L&K Group' with uppercase L and K, ampersand, and capital G lowercase roup. No tagline, no invented credentials or dates, no roof clip art, no mockup or scene, no decorative gradients, no small fine detail. Plain vector-like bitmap wordmark on genuinely transparent background, clean sharp lettering, suitable for a website header. This is a provisional brand asset, not a finished identity.

### 주방 — transparent_background=false

Use case: photorealistic-natural. Asset type: provisional website gallery photograph for an Australian home maintenance company, kitchen cabinet painting service. A believable modest Sydney suburban kitchen after a careful repaint of existing shaker cabinet doors, softly warm off-white painted cabinetry, subtle visible painted wood texture, simple light stone-look bench, restrained brushed metal handles, a small window with soft eucalyptus foliage out of focus outside, warm daylight, practical tidy lived-in residential setting, understated quality craftsmanship rather than luxury construction. Wide landscape editorial architectural photography, eye-level three-quarter view, natural lens perspective, sharp cabinet door edges and clean uniform paint finish, neutral warm white and muted timber tones. No people, text, logos, labels, watermark, price, before/after split, tools, false project signage, or lavish mansion features. This is a fictional concept scene, not documentary evidence of a real company's completed work. Compose for a horizontal 3:2 website photo with cabinet fronts clearly visible.

### 거실 — transparent_background=false

Use case: photorealistic-natural. Asset type: temporary concept gallery photograph for an Australian residential painting and home maintenance website. A modest well-maintained Sydney suburban living room with freshly painted warm off-white walls, crisp simple timber skirting, natural oak flooring, a small neutral linen sofa partially visible, simple wood door frame and a large ordinary window looking toward an Australian garden with eucalyptus leaves. Emphasise careful clean interior wall paint finish, no extravagant architecture. Authentic daylight editorial architectural photograph, three-quarter eye-level view with natural straight lines, wide 3:2 horizontal composition, restrained neutral palette consistent with warm white residential kitchen photography. Quiet practical comfortable room, no people, no tools, no text or logos, no watermark, no before-after split. Fictional interior for design exploration, not an actual company's project.

### 캐비넷 마감 상세 — transparent_background=false

2026-09-27 내장 `image_gen` 생성 후 시각 확인. 원본 생성 파일을 위 프로젝트 경로로 복사했으며 기존 주방 이미지는 유지했다. 중앙 설정 `siteAssets.cabinetFinish`의 src·alt·크기를 함께 바꾸면 후속 사진으로 교체할 수 있다.

Use case: photorealistic-natural. Asset type: supporting photograph for a local Kitchen Cabinet Painting website prototype. Primary request: a believable close editorial view of existing cream painted shaker kitchen cabinet doors and a matching drawer, showing the subtle satin painted finish, neat recessed panel edges, and a simple brushed nickel handle. Scene: a modest Australian suburban kitchen with a light stone-look benchtop edge, a small portion of off-white splashback, softly out-of-focus timber floor. Style: natural architectural photography, warm window daylight, calm practical lived-in home; visually consistent with warm off-white shaker cabinetry and restrained timber tones. Composition: horizontal 3:2, aim 1536x1024, focus on two cabinet door panels and drawer with enough surrounding context, natural straight perspective, detailed surface texture. No people, text, logos, labels, watermark, tools, paint brand, before/after split, or luxury construction. Fictional concept illustration, not evidence of a real company's completed work.

## 2026-09-27 이미지 정리 검증

중복 4쌍의 SHA-256을 삭제 직전에 재확인하고 지정한 6개 파일만 삭제했다. 남은 이미지 34개의 바이트는 정리 전과 모두 같으며, 중앙 설정의 웹 이미지 6개와 수정한 문서 링크가 실제 파일을 가리키는지 확인했다. `npm run check`의 lint·타입·production build 및 `git diff --check`를 통과했다.

기존 3001번 production 서버는 시작 시 읽은 public 파일 목록이 갱신되지 않아 새 회사 이미지 4개에 404를 반환했다. 해당 프로젝트 서버만 최신 빌드로 재시작한 뒤 `/`, `/services/cabinet-painting`, 웹 이미지 6개 모두 HTTP 200을 확인했고 이미지 응답의 SHA-256도 보존한 원본 파일과 일치했다. 3000번 서버는 변경하지 않았다. 이는 HTTP·파일 검증이며 새로운 실제 브라우저 QA를 수행했다는 뜻은 아니다.
