import React from 'react';
import { CustomModal } from './CustomModal';

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

export function ErrorModal({
  visible,
  title,
  message,
  buttonText,
  onPress,
}: ErrorModalProps) {
  return (
    <CustomModal
      visible={visible}
      title={title}
      message={message}
      buttonText={buttonText}
      onPress={onPress}
      iconName="close-circle"
      iconColor="#E74C3C"
      buttonColors={['#E74C3C', '#C0392B']}
    />
  );
}
