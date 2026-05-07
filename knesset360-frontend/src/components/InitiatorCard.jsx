import './InitiatorCard.css'
import userSvg from '../assets/user.svg';

export default function InitiatorCard({ initiator, onClick, isSelected }) {
    return (
        <div 
            onClick={() => onClick(initiator.id)}
            className={`initiator-card ${isSelected ? 'selected' : ''}`}
        >
            <img 
                // src={initiator.imgPath || '../assets/user.svg'} 
                src= {userSvg}
                alt={initiator.name} 
            />
            <div className="initiator-info">
                <h3>{initiator.name}</h3>
                <p><strong>{initiator.count}</strong> :הצעות חוק</p>
            </div>
        </div>
    );
};