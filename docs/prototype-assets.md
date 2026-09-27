# 메인 프로토타입 임시 자산

2026-09-27 · 내장 `image_gen` 도구로 생성. 최종 브랜드·실제 시공 실적이 아닌 임시 자료다. 원본은 프로젝트 `public/images/`에 보관하며 실제 자료가 오면 콘텐츠의 자산 경로·크기·alt를 함께 교체한다. 사진은 `next/image`로 화면 크기에 맞춰 제공한다.

| 파일 | 크기 | 용도 | 표시 기준 |
| --- | --- | --- | --- |
| `public/images/lk-group-wordmark-concept.png` | 2172×724, 투명 PNG | 헤더 로고 | alt: L&K Group |
| `public/images/kitchen-cabinet-concept.png` | 1536×1024 | 캐비넷 컨셉 사진 | 생성된 공간 예시, 실제 프로젝트가 아님 |
| `public/images/living-room-concept.png` | 1536×1024 | 실내 도장 컨셉 사진 | 생성된 공간 예시, 실제 프로젝트가 아님 |
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
