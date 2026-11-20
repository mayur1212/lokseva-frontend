import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

export function ConfirmationModal({ title, description, open, onClose, onConfirm, danger }: { title: string; description: string; open: boolean; onClose: () => void; onConfirm: () => void; danger: boolean }) {
  return <AlertDialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="modal-overlay" />
      <AlertDialog.Content className="modal-content">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>
        <div className="form-actions"><AlertDialog.Cancel asChild><Button variant="outline">रद्द करा</Button></AlertDialog.Cancel>
          <Button variant={danger ? "danger" : "default"} onClick={onConfirm}>निर्णय निश्चित करा</Button></div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>;
}
