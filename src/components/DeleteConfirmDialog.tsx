import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  onClose: () => void;
  onDeleteSingle: () => void;
  onDeleteWithChildren: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  onClose,
  onDeleteSingle,
  onDeleteWithChildren,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">ノードの削除</h3>
        <div className="space-y-4">
          <button
            onClick={onDeleteSingle}
            className="w-full flex items-center justify-between px-4 py-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="font-medium">選択したノードのみを削除</div>
              <div className="text-sm text-gray-500">子ノードは親ノードに接続されます</div>
            </div>
            <Trash2 size={20} className="text-gray-400" />
          </button>
          
          <button
            onClick={onDeleteWithChildren}
            className="w-full flex items-center justify-between px-4 py-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <div className="font-medium">すべての子ノードと一緒に削除</div>
              <div className="text-sm text-gray-500">選択したノードとその配下のノードをすべて削除します</div>
            </div>
            <Trash2 size={20} className="text-gray-400" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}