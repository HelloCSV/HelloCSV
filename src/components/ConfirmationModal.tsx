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
          className="hc:text-hello-csv-danger hc:size-6"
          aria-hidden="true"
        />
      ),
      btnVariant: 'danger',
      bgColor: 'hc:bg-hello-csv-danger-extra-light',
    },
    default: {
      btnVariant: 'primary',
    },
  };

  const { icon, btnVariant, bgColor } = baseClasses[variant];

  return (
    <Dialog open={open} onClose={setOpen} className="hc:relative hc:z-10">
      <DialogBackdrop
        transition
        className="hc:bg-hello-csv-overlay/75 hc:fixed hc:inset-0 hc:transition-opacity hc:data-closed:opacity-0 hc:data-enter:duration-300 hc:data-enter:ease-out hc:data-leave:duration-200 hc:data-leave:ease-in"
      />

      <div className="hc:fixed hc:inset-0 hc:z-10 hc:w-screen hc:overflow-y-auto">
        <div className="hc:flex hc:min-h-full hc:items-end hc:justify-center hc:p-4 hc:text-center hc:sm:items-center hc:sm:p-0">
          <DialogPanel
            transition
            className="hc:bg-hello-csv-surface-raised hc:relative hc:transform hc:overflow-hidden hc:rounded-lg hc:px-4 hc:pt-5 hc:pb-4 hc:text-left hc:shadow-xl hc:transition-all hc:data-closed:translate-y-4 hc:data-closed:opacity-0 hc:data-enter:duration-300 hc:data-enter:ease-out hc:data-leave:duration-200 hc:data-leave:ease-in hc:sm:my-8 hc:sm:w-full hc:sm:max-w-lg hc:sm:p-6 hc:data-closed:sm:translate-y-0 hc:data-closed:sm:scale-95"
          >
            <div className="hc:sm:flex hc:sm:items-start">
              {icon && (
                <div
                  className={`hc:mx-auto hc:flex hc:size-12 hc:shrink-0 hc:items-center hc:justify-center hc:rounded-full ${bgColor} hc:sm:mx-0 hc:sm:size-10`}
                >
                  {icon}
                </div>
              )}
              <div className="hc:mt-3 hc:text-center hc:sm:mt-0 hc:sm:ml-4 hc:sm:text-left">
                <DialogTitle
                  as="h3"
                  className="hc:text-hello-csv-text hc:text-base hc:font-semibold"
                >
                  {title}
                </DialogTitle>
                {subTitle && (
                  <div className="hc:mt-2">
                    <p className="hc:text-hello-csv-text-muted hc:text-sm">
                      {subTitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="hc:mt-5 hc:sm:mt-4 hc:sm:flex hc:sm:flex-row-reverse">
              <div className="hc:sm:ml-3 hc:sm:w-auto">
                <Button
                  variant={btnVariant}
                  onClick={() => {
                    onConfirm();
                    setOpen(false);
                  }}
                  withFullWidth
                >
                  {confirmationText ??
                    t('components.confirmationModal.defaultConfirm')}
                </Button>
              </div>
              <div className="hc:mt-3 hc:sm:mt-0 hc:sm:w-auto">
                <Button
                  variant="tertiary"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  withFullWidth
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
