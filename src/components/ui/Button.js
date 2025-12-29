import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

const Button = ({ loading, children, ...props }) => (
  <PaperButton loading={loading} disabled={loading} {...props}>
    {children}
  </PaperButton>
);

export default Button;
