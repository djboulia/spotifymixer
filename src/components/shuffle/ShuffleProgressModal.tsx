import type { PlayListDetails } from "~/models/playlist";
import type {
  MixerCategoryStats,
  MultipleShuffleProgressStatus,
} from "~/models/shuffle";
import { Modal } from "~/components/base/Modal";
import { Progress } from "../ui/progress";
import { ProgressStats } from "./ProgressStats";

export const ShuffleProgressModal = ({
  playlist,
  multipleStatus,
  percentComplete,
  categories,
}: {
  playlist: PlayListDetails;
  multipleStatus: MultipleShuffleProgressStatus | undefined;
  percentComplete: number;
  categories: MixerCategoryStats[];
}) => {
  const multipleStatusMessage = function (
    status: MultipleShuffleProgressStatus | undefined,
  ) {
    if (!status || status.total <= 1) {
      return "";
    }

    return `${status.current} of ${status.total}`;
  };

  return (
    <Modal
      isOpen={true}
      title={`Shuffling ${playlist.name} ${multipleStatusMessage(multipleStatus)}`}
    >
      <>
        <div className="m-4">
          <Progress value={percentComplete} />
        </div>

        <ProgressStats categories={categories} />
      </>
    </Modal>
  );
};
