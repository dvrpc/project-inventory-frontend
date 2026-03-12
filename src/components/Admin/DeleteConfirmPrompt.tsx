import { Trash2, X } from 'lucide-react';

interface Props {
  projectId: string | number;
  projectTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmPrompt({
  projectId,
  projectTitle,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-10 bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-sm mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-800">
              Delete project
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-600 mb-6">
          Are you sure you want to delete{' '}
          {projectTitle ? (
            <span className="font-medium text-zinc-800">"{projectTitle}"</span>
          ) : (
            <>
              project{' '}
              <span className="font-mono text-xs bg-zinc-100 text-zinc-500 rounded px-1.5 py-0.5">
                {projectId}
              </span>
            </>
          )}
          ?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
