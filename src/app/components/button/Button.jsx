const WebButton = ({ onClick, label }) => {
    return (
      <div>
        <button onClick={onClick} className="bg-blue-500 px-3 py-0.5 rounded-lg" >
          {label}
        </button>
      </div>
      
    );
  };
  
  export default WebButton;