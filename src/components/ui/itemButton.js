import React from 'react'
import {Button} from 'antd'
    const itemButton = (item, selected, onClick) => (
    <Button
        block
        onClick={onClick}
        icon={<img src={`/assets/icons/items/${item.icon ?? 'default.svg'}`} alt="" width={50} height={50} />}
        style={{
        height: 'auto',
        padding: '15px 8px',
        flexDirection: 'column',
        gap: 20,
        ...(selected && { borderColor: '#1677ff', background: '#e6f4ff' }),
        }}
    >
        <div>{item.name}</div>
        <div style={{ fontSize: 12, opacity: 0.65 }}>
        {Number(item.price).toFixed(2)} / pc
        </div>
    </Button>
    );


export default itemButton