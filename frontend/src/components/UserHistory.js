import React, { useState, useEffect } from "react";
import * as helpers from "../utils/helpers";
import { addSearchToHistory } from "../utils/helpers";

function UserHistory({ isOpen, onClose, onSelectSearch }) {
    const [history, setHistory] = useState([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('search_history');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setHistory(parsed.map(item => ({
                    ...item,
                    created_at: new Date(item.created_at)
                })));
            } catch (e) {
                setHistory([]);
            }
        }
    }, []);

    // Helper to clear history
    const handleClearHistory = () => {
        localStorage.removeItem('search_history');
        setHistory([]);
    };

    const handleSearchSelect = (historyItem) => {
        const searchParams = {
            query: historyItem.query,
            cuisine: '',
            meal_type: '',
            diet: '',
            max_results: 12
        };
        onSelectSearch(searchParams);
        onClose();
    };



    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-history me-2"></i>Search History
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        {history.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                <h6>No Search History</h6>
                                <p className="text-muted">Start searching for recipes to see your history here.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-3">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Click on any search to repeat it
                                </p>
                                <button className="btn btn-sm btn-outline-danger mb-3" onClick={handleClearHistory} type="button">
                                    <i className="fas fa-trash me-1"></i>Clear History
                                </button>
                                {history.map(item => (
                                    <div 
                                        key={item.id} 
                                        className="border rounded p-3 mb-2 cursor-pointer"
                                        onClick={() => handleSearchSelect(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between">
                                            <span><i className="fas fa-search me-2"></i>{item.query}</span>
                                            <small className="text-muted">
                                                {item.created_at.toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserHistory;
