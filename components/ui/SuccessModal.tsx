import React from 'react';
import { CustomModal } from './CustomModal';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

export function SuccessModal({
  visible,
  title,
  message,
  buttonText,
  onPress,
}: SuccessModalProps) {
  return (
    <CustomModal
      visible={visible}
      title={title}
      message={message}
      buttonText={buttonText}
      onPress={onPress}
      iconName="checkmark"
      iconColor="#4ECDC4"
      buttonColors={['#4ECDC4', '#44A08D']}
    />
  );
}
