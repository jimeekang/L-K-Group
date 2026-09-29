import { siteAssets } from "@/shared/config/assets";
import { ServiceStory } from "@/shared/ui/service-story";
import { createCabinetStoryContent } from "../content/cabinet-story-content";

const story = createCabinetStoryContent({
  existing: siteAssets.frontStoryExisting,
  removed: siteAssets.frontStoryRemoved,
  workshopExisting: siteAssets.storyWorkshopExisting,
  prepared: siteAssets.frontStoryPrepared,
  undercoat: siteAssets.storyUndercoat,
  coatOne: siteAssets.frontStoryCoatOne,
  coatTwo: siteAssets.frontStoryCoatTwo,
  finished: siteAssets.frontStoryFinished,
  assembleBackground: siteAssets.frontStoryAssembleBackground,
});

export function CabinetProcessStory() {
  return <ServiceStory {...story} />;
}
