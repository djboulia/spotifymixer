import BaseModal from "react-modal";

export const Modal = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      ariaHideApp={false}
      className="bg-spotify-950 text-spotify-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg shadow-xl"
      overlayClassName="fixed inset-0 bg-black/75 bgflex items-center justify-center"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      onRequestClose={() => {
        console.log("Modal request close");
        onClose?.();
      }}
    >
      <h3
        id="dialog-title"
        className="bg-spotify-900 rounded-tl-lg rounded-tr-lg py-2 text-center text-lg font-semibold"
      >
        {title}
      </h3>

      <div
        tabIndex={0}
        className="flex min-h-full min-w-[350px] flex-col items-center justify-center p-6 focus:outline-none sm:m-0 sm:items-center md:min-w-[400px]"
      >
        <div className="flex flex-col justify-center px-4 pt-5 pb-4">
          {children}
        </div>
      </div>
    </BaseModal>
  );
};
