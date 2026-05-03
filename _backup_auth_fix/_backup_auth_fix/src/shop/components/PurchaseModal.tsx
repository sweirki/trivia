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
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
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
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#111",
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 16,
    textAlign: "center",
  },

  itemLabel: {
    color: "#FFF",
    fontSize: 18,
    marginTop: 8,
    textAlign: "center",
  },

  price: {
    color: "#FFD700",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 20,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#444",
    marginRight: 8,
  },

  cancelText: {
    textAlign: "center",
    color: "#DDD",
    fontSize: 16,
    fontWeight: "700",
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFD700",
    marginLeft: 8,
  },

  confirmText: {
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
  },
});


