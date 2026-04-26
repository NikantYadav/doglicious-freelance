import React from 'react';
import { BLOGS } from '../../data/homeData';

export default function BlogModal({ isOpen, onClose, activeBlogId }) {
    const blog = BLOGS[activeBlogId];

    return (
        <div className={`mbk${isOpen ? ' o' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="mbox blog-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="bm-head">
                    <span className="bm-tag">{blog ? blog.tag : 'Doglicious Blog'}</span>
                    <button className="mcl" onClick={onClose}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    </button>
                </div>
                {blog && (
                    <div className="bm-body">
                        <h1 className="art-h1-b">{blog.title}</h1>
                        <div className="art-meta-b">
                            <span className="art-kw-b">{blog.kw}</span>
                            <span className="art-mins-b">{blog.mins} min read</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: blog.body }} />
                    </div>
                )}
            </div>
        </div>
    );
}
