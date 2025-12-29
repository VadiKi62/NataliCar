"use client";

import React from "react";
import Snackbar from "@app/components/common/Snackbar";

/**
 * AdminNotifications - централизованные уведомления для админки
 * @param {object} props
 * @param {object} props.status - { type: number, message: string }
 * @param {function} props.onClose - callback при закрытии
 */
export default function AdminNotifications({ status, onClose }) {
  if (!status) return null;

  return (
    <Snackbar
      key={status.message + status.type}
      message={status.message}
      isError={status.type !== 200}
      closeFunc={onClose}
      open={Boolean(status)}
    />
  );
}

