import type { PlayListDetails } from "~/models/playlist";
import type {
  MixerCategoryStats,
  MultipleShuffleProgressStatus,
} from "~/models/shuffle";
import Modal from "react-modal";
import { ProgressBar } from "./ProgressBar";
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
      ariaHideApp={false}
      className="bg-spotify-950 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg p-6 shadow-xl"
      overlayClassName="fixed inset-0 bg-black/75 bgflex items-center justify-center"
    >
      <div
        tabIndex={0}
        className="flex min-h-full min-w-[350px] items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0 md:min-w-[400px]"
      >
        <div className="flex flex-col justify-center px-4 pt-5 pb-4">
          <h3 id="dialog-title" className="text-base font-semibold">
            Shuffling {playlist.name} {multipleStatusMessage(multipleStatus)}
          </h3>

          <div className="m-4">
            <ProgressBar percentComplete={percentComplete} />
          </div>

          <ProgressStats categories={categories} />
        </div>
      </div>
    </Modal>
  );
};
