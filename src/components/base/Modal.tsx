import { DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>
            <div className="py-2 text-center text-lg font-semibold">
              {title}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div
          tabIndex={0}
          className="flex min-h-full min-w-[350px] flex-col items-center justify-center p-6 focus:outline-none sm:m-0 sm:items-center md:min-w-[400px]"
        >
          <div className="flex flex-col justify-center px-4 pt-5 pb-4">
            {children}
          </div>
        </div>{" "}
      </DialogContent>
    </Dialog>
  );
};
