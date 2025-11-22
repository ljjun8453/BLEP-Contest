import { useState, useEffect } from 'react';
import styled from 'styled-components';

const MemoSectionContainer = styled.section`
  padding: 30px;
  background: white;
  border-top: 1px solid #dee2e6;
`;

const MemoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const MemoTitle = styled.div`
  h2 {
    margin: 0;
    font-size: 24px;
    color: #212529;
  }

  p {
    margin: 5px 0 0 0;
    color: #6c757d;
    font-size: 14px;
  }
`;

const MemoCount = styled.div`
  background: #e9ecef;
  color: #495057;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const MemoInputSection = styled.div`
  margin-bottom: 30px;
`;

const MemoInputContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
`;

const MemoTextarea = styled.textarea`
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }
`;

const CharCount = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const AddMemoBtn = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const MemoListContainer = styled.div`
  max-height: 500px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const EmptyMemo = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #495057;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const MemoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MemoItem = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    border-color: #dee2e6;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const MemoContent = styled.div`
  flex: 1;

  p {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.4;
    color: #212529;
    word-break: break-word;
  }
`;

const MemoTimestamp = styled.small`
  font-size: 12px;
  color: #6c757d;
`;

const DeleteMemoBtn = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #dee2e6;
  }

  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const MemoSectionComponent = () => {
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');

  useEffect(() => {
    const savedMemos = localStorage.getItem('inspection-memos');
    if (savedMemos) {
      try {
        setMemos(JSON.parse(savedMemos));
      } catch (error) {
        console.error('메모 데이터를 불러오는데 실패했습니다:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inspection-memos', JSON.stringify(memos));
  }, [memos]);

  const addMemo = () => {
    if (newMemo.trim()) {
      const memo = {
        id: Date.now(),
        content: newMemo.trim(),
        timestamp: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMemos([memo, ...memos]);
      setNewMemo('');
    }
  };

  const deleteMemo = (id) => {
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      setMemos(memos.filter(memo => memo.id !== id));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addMemo();
    }
  };

  return (
    <MemoSectionContainer>
      <MemoHeader>
        <MemoTitle>
          <h2>📝 점검 메모</h2>
          <p>점검 관련 중요 사항을 기록하세요</p>
        </MemoTitle>
        <MemoCount>
          총 {memos.length}개의 메모
        </MemoCount>
      </MemoHeader>

      <MemoInputSection>
        <MemoInputContainer>
          <MemoTextarea
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="새 메모를 입력하세요... (Ctrl+Enter로 저장)"
            rows={4}
            maxLength={500}
          />
          <InputFooter>
            <CharCount>{newMemo.length}/500</CharCount>
            <AddMemoBtn 
              onClick={addMemo}
              disabled={!newMemo.trim()}
            >
              메모 추가
            </AddMemoBtn>
          </InputFooter>
        </MemoInputContainer>
      </MemoInputSection>

      <MemoListContainer>
        {memos.length === 0 ? (
          <EmptyMemo>
            <div className="empty-icon">📝</div>
            <h3>아직 작성된 메모가 없습니다</h3>
            <p>점검 과정에서 중요한 사항들을 메모해보세요.</p>
          </EmptyMemo>
        ) : (
          <MemoList>
            {memos.map(memo => (
              <MemoItem key={memo.id}>
                <MemoContent>
                  <p>{memo.content}</p>
                  <MemoTimestamp>{memo.timestamp}</MemoTimestamp>
                </MemoContent>
                <DeleteMemoBtn 
                  onClick={() => deleteMemo(memo.id)}
                  title="메모 삭제"
                >
                  🗑️
                </DeleteMemoBtn>
              </MemoItem>
            ))}
          </MemoList>
        )}
      </MemoListContainer>
    </MemoSectionContainer>
  );
};

export default MemoSectionComponent;