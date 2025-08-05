import React from 'react';
import type { FC } from 'react';
import HistoryItem from '../HistoryItem';

// 模拟历史对话数据
const mockHistoryData = [
    { chatId: '7', title: 'LiFePO4石墨电池电解质推荐', isPinned: true },
    { chatId: '1', title: '电解质溶剂稳定性预测分析', isPinned: false },
    { chatId: '2', title: '锂枝晶形成原因及抑制方法', isPinned: false },
    { chatId: '3', title: 'SEI层组成成分研究', isPinned: false },
    { chatId: '4', title: '高镍正极材料性能优化', isPinned: false },
    { chatId: '5', title: '固态电解质界面稳定性', isPinned: false },
    { chatId: '6', title: '电池热管理系统设计', isPinned: false },
    { chatId: '8', title: '磷酸铁锂正极材料改性研究', isPinned: false },
    { chatId: '9', title: '钠离子电池电解质设计', isPinned: false },
    { chatId: '10', title: '锂硫电池正极材料优化', isPinned: false },
    { chatId: '11', title: '固态电池界面工程研究', isPinned: false },
    { chatId: '12', title: '电池循环寿命预测模型', isPinned: false },
    { chatId: '13', title: '快充技术对电池性能影响', isPinned: false },
    { chatId: '14', title: '电池安全性能评估方法', isPinned: false },
    { chatId: '15', title: '锂离子电池容量衰减机理', isPinned: false },
    { chatId: '16', title: '电池管理系统算法优化', isPinned: false },
    { chatId: '17', title: '新型电解质添加剂研究', isPinned: false },
    { chatId: '18', title: '电池材料表征技术进展', isPinned: false },
    { chatId: '19', title: '电池回收技术发展趋势', isPinned: false },
    { chatId: '20', title: '电池制造工艺优化方案', isPinned: false },
];

const ChatHistory: FC = () => {
    const handleChatClick = (chatId: string) => {
        console.log('点击对话:', chatId);
        // 这里可以实现跳转到对应对话的逻辑
    };

    const handleRename = (chatId: string, newTitle: string) => {
        console.log('重命名对话:', chatId, newTitle);
        // 这里可以实现重命名对话的逻辑
    };

    const handleTogglePin = (chatId: string) => {
        console.log('切换置顶状态:', chatId);
        // 这里可以实现切换置顶状态的逻辑
    };

    const handleDelete = (chatId: string) => {
        console.log('删除对话:', chatId);
        // 这里可以实现删除对话的逻辑
    };

    return (
        <>
            <nav className="history-nav">
                <p className="history-title">历史对话</p>
                <ul>
                    {mockHistoryData.map((item) => (
                        <HistoryItem
                            key={item.chatId}
                            chatId={item.chatId}
                            title={item.title}
                            isPinned={item.isPinned}
                            onChatClick={handleChatClick}
                            onRename={handleRename}
                            onTogglePin={handleTogglePin}
                            onDelete={handleDelete}
                        />
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default ChatHistory;