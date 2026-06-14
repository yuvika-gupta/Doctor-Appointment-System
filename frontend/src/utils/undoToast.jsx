import { toast } from 'react-toastify';

/**
 * Shows a vivid red Undo toast with a prominent UNDO button.
 * The action only fires after delayMs milliseconds.
 * Clicking UNDO cancels the pending action.
 */
export const withUndo = (message, action, delayMs = 5000) => {
  const cancelledRef = { current: false };
  let timerId = null;

  const undoBtn = `
    <button id="undo-btn" style="
      background:#fff;
      color:#b71c1c;
      border:3px solid #fff;
      border-radius:8px;
      padding:8px 20px;
      font-weight:800;
      font-size:14px;
      cursor:pointer;
      flex-shrink:0;
      box-shadow:0 3px 10px rgba(0,0,0,0.3);
      letter-spacing:0.5px;
    ">↩ UNDO</button>
  `;

  const toastId = toast.error(
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', width:'100%', padding: '2px 0' }}>
      <span style={{ flex:1, fontSize:'14px', fontWeight:500, lineHeight:'1.4' }}>{message}</span>
      <button
        onClick={() => {
          cancelledRef.current = true;
          clearTimeout(timerId);
          toast.dismiss(toastId);
          toast.success('Action undone!', { autoClose: 2000 });
        }}
        style={{
          background: '#fff',
          color: '#b71c1c',
          border: '3px solid #fff',
          borderRadius: '8px',
          padding: '8px 20px',
          fontWeight: 800,
          fontSize: '14px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
        }}
      >
        ↩ UNDO
      </button>
    </div>,
    {
      toastId: `undo-${Date.now()}`,
      autoClose: delayMs,
      closeButton: true,
      draggable: false,
      style: {
        background: 'linear-gradient(135deg, #e53935, #b71c1c)',
        color: '#fff',
        borderRadius: '12px',
        padding: '14px 16px',
        boxShadow: '0 8px 32px rgba(183,28,28,0.6)',
        minWidth: '350px',
        maxWidth: '480px',
        border: '1px solid rgba(255,255,255,0.2)',
      },
      progressStyle: {
        background: 'rgba(255,255,255,0.65)',
        height: '4px',
      },
      icon: false,
    }
  );

  timerId = setTimeout(async () => {
    if (!cancelledRef.current) {
      await action();
    }
  }, delayMs);
};
