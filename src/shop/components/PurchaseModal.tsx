// PurchaseModal.tsx — A+++++ Universal Purchase Confirmation Modal
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { feedback } from "@/feedback";

export default function PurchaseModal({ visible, item, onConfirm, onClose }) {
  if (!item) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Purchase</Text>

          <Text style={styles.itemLabel}>{item.label || item.amount + " Pack"}</Text>

          <Text style={styles.price}>{item.price}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                feedback.tap();
                onClose?.();
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                feedback.purchaseSuccess();
                onConfirm?.();
              }}
            >
              <Text style={styles.confirmText}>Buy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#101827",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "rgba(246,196,83,0.42)",
    shadowColor: "#F6C453",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#F6C453",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  itemLabel: {
    color: "#F4FAFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },

  price: {
    color: "#F6C453",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 20,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "rgba(27,36,58,0.95)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.18)",
  },

  cancelText: {
    textAlign: "center",
    color: "#D8E7FF",
    fontSize: 14,
    fontWeight: "900",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#00D4FF",
  },

  confirmText: {
    textAlign: "center",
    color: "#07111F",
    fontSize: 14,
    fontWeight: "900",
  },
});
