import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { usePlayerStore } from "@/store/usePlayerStore";
import { useArenaEconomyStore } from "@/arena/store/useArenaEconomyStore";
import { useArenaShopStore } from "@/arena/store/useArenaShopStore";
import { s } from "@/arena/theme/arenaSizing";
import { useThemedAlert } from "@/components/ThemedAlert";

export default function ArenaShop() {
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const coins = usePlayerStore((s) => s.coins);
  const arenaTokens = useArenaEconomyStore((s) => s.arenaTokens);
  const powerCharges = useArenaEconomyStore((s) => s.powerCharges);

  const buySingleCharge = useArenaShopStore((s) => s.buySingleCharge);
  const buyFiveCharges = useArenaShopStore((s) => s.buyFiveCharges);
  const buyPremiumCharges = useArenaShopStore((s) => s.buyPremiumCharges);

  const handleBuy = (action: () => boolean, failMsg: string) => {
    const success = action();
    if (!success) {
      showThemedAlert("Purchase failed", failMsg, "danger");
    } else {
      showThemedAlert("Purchase complete", "Your arena item has been added.", "success");
    }
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Arena Shop</Text>

      {/* BALANCES */}
      <View style={styles.balanceBox}>
        <Balance label="Coins" value={coins} />
        <Balance label="Arena Tokens" value={arenaTokens} />
        <Balance label="Power Charges" value={powerCharges} />
      </View>

      {/* ITEMS */}
      <ShopButton
        title="+1 Power Charge"
        price="50 Coins"
        disabled={coins < 50}
        onPress={() =>
          handleBuy(buySingleCharge, "Not enough coins")
        }
      />

      <ShopButton
        title="+5 Power Charges"
        price="220 Coins"
        disabled={coins < 220}
        onPress={() =>
          handleBuy(buyFiveCharges, "Not enough coins")
        }
      />

      <ShopButton
        title="+5 Power Charges (Premium)"
        price="3 Arena Tokens"
        disabled={arenaTokens < 3}
        onPress={() =>
          handleBuy(buyPremiumCharges, "Not enough arena tokens")
        }
      />
    </View>
    {themedAlert}
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Balance({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.balanceItem}>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={styles.balanceValue}>{value}</Text>
    </View>
  );
}

function ShopButton({
  title,
  price,
  disabled,
  onPress,
}: {
  title: string;
  price: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, disabled && styles.disabled]}
      disabled={disabled}
      onPress={onPress}
     activeOpacity={0.72}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
    </TouchableOpacity>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: s(60),
    paddingHorizontal: s(20),
  },

  title: {
    color: "#FFD54F",
    fontSize: s(28),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: s(30),
  },

  balanceBox: {
    backgroundColor: "#1b1b27",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(30),
  },

  balanceItem: {
    marginBottom: s(12),
  },

  balanceLabel: {
    color: "#aaa",
    fontSize: s(14),
  },

  balanceValue: {
    color: "#fff",
    fontSize: s(22),
    fontWeight: "700",
  },

  item: {
    backgroundColor: "#272737",
    padding: s(18),
    borderRadius: s(14),
    marginBottom: s(15),
  },

  itemTitle: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "600",
  },

  itemPrice: {
    color: "#aaa",
    fontSize: s(14),
    marginTop: s(4),
  },

  disabled: {
    opacity: 0.4,
  },
});


