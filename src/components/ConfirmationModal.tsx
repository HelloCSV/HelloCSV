import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'preact/compat';
import Button, { ButtonVariant } from './Button';
import { useTranslations } from '../i18';

type VariantType = 'default' | 'danger';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  subTitle?: string;
  confirmationText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: VariantType;
}

export default function ConfirmationModal({
  open,
  setOpen,
  title,
  subTitle,
  confirmationText,
  cancelText,
  onConfirm,
  variant = 'default',
}: Props) {
  const { t } = useTranslations();

  const baseClasses: Record<
    VariantType,
    { icon?: ReactNode; btnVariant: ButtonVariant; bgColor?: string }
  > = {
    danger: {
      icon: (
        <ExclamationTriangleIcon
          className="text-hello-csv-danger size-6"
          aria-hidden="true"
        />
      ),
      btnVariant: 'danger',
      bgColor: 'bg-hello-csv-danger-extra-light',
    },
    default: {
      btnVariant: 'primary',
    },
  };

  const { icon, btnVariant, bgColor } = baseClasses[variant];

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="sm:flex sm:items-start">
              {icon && (
                <div
                  className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:size-10`}
                >
                  {icon}
                </div>
              )}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {title}
                </DialogTitle>
                {subTitle && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{subTitle}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <div className="sm:ml-3 sm:w-auto">
                <Button
                  variant={btnVariant}
                  onClick={() => {
                    onConfirm();
                    setOpen(false);
                  }}
                  size="full"
                >
                  {confirmationText ??
                    t('components.confirmationModal.defaultConfirm')}
                </Button>
              </div>
              <div className="mt-3 sm:mt-0 sm:w-auto">
                <Button
                  variant="tertiary"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  size="full"
                >
                  {cancelText ?? t('components.confirmationModal.cancel')}
                </Button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
