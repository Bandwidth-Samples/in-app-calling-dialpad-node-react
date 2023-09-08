import React from 'react';
import '../css/Alert.css'

export default function Alert({type, text}) {
    const icons = new Map([
        ['success', 'check_circle'],
        ['info', 'info'],
        ['warning', 'report_problem'],
        ['error', 'error_outline']
    ])

    return(
        <div className='alert-container'>
            <div className={`alert ${`alert-${type}`}`}>
                <div className='alert-icon'>{icons.get(type)}</div>
                <div className='alert-text'>{text}</div>
            </div>
        </div>
    )
}
