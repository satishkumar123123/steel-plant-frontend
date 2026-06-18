function BridleButton({ bridleNo, onClick }) {
  return (
    <button
      onClick={() => onClick(bridleNo)}
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        borderRadius: "5px",
      }}
    >
      Bridle {bridleNo}
    </button>
  );
}

export default BridleButton;
