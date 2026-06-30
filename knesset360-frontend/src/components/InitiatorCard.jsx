import './InitiatorCard.css'
import userSvg from '../assets/user.svg';


const handleError = (e) => {
    e.target.src = userSvg;
  };

export default function InitiatorCard({ initiator, onClick, isSelected }) {
    return (
        <div 
            onClick={() => onClick(initiator.id)}
            className={`initiator-card ${isSelected ? 'selected' : ''}`}
        >
            <img 
                src={`/mk-photos/${initiator.id}.jpg`}
                alt={initiator.name}
                onError={handleError}
            />
            <div className="initiator-info">
                <h3>{initiator.name}</h3>
                <p> הצעות חוק: <strong>{initiator.count}</strong></p>
            </div>
        </div>
    );
};