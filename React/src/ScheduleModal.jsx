import { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #212529;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f8f9fa;
    color: #212529;
  }
`;

const LocationInfo = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  h3 {
    margin: 0 0 8px 0;
    color: #212529;
    font-size: 18px;
  }

  p {
    margin: 0;
    color: #6c757d;
    font-size: 14px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #212529;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &.cancel {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }

  &.confirm {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
`;

const ScheduleModal = ({ isOpen, onClose, inspection, onConfirm }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.time) {
      onConfirm(formData);
      setFormData({ date: '', time: '', notes: '' });
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !inspection) return null;

  // 오늘 날짜를 최소값으로 설정
  const today = new Date().toISOString().split('T')[0];

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>점검 일정 추가</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <LocationInfo>
          <h3>{inspection.location}</h3>
          <p>📍 {inspection.district} • 위험도: {inspection.riskScore}/100</p>
        </LocationInfo>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="date">점검 날짜</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={today}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="time">점검 시간</Label>
            <Input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="notes">메모 (선택사항)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="점검 시 주의사항이나 특이사항을 입력하세요..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" className="cancel" onClick={onClose}>
              취소
            </Button>
            <Button 
              type="submit" 
              className="confirm"
              disabled={!formData.date || !formData.time}
            >
              일정 추가
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ScheduleModal;