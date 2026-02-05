import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useApprovalsStore } from "../store/approvalsStore";
import { ApprovalAction } from "../types";

function HistoryCard({ action, onPress }: { action: ApprovalAction; onPress: () => void }) {
  const formattedDate = new Date(action.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getActionColor = () => {
    switch (action.action) {
      case "swap":
        return "text-blue-400";
      case "transfer":
        return "text-green-400";
      case "trade":
        return "text-purple-400";
      case "stake":
        return "text-yellow-400";
      case "unstake":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-zinc-900 rounded-xl p-4 mb-3 border border-zinc-800"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
              action.status === "approved" ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <Text className="text-lg">{action.status === "approved" ? "✓" : "✕"}</Text>
          </View>
          <View>
            <Text className="text-white font-semibold text-base">{action.coin}</Text>
            <Text className={`text-sm ${getActionColor()}`}>
              {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white font-bold text-lg">{action.amount}</Text>
          <Text className="text-zinc-500 text-xs">{formattedDate}</Text>
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-zinc-800 flex-row justify-between items-center">
        <Text
          className={`text-sm font-medium ${
            action.status === "approved" ? "text-green-500" : "text-red-500"
          }`}
        >
          {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
        </Text>
        <Text className="text-zinc-600 text-xs">Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { history, clearHistory } = useApprovalsStore();

  const handleClearHistory = () => {
    if (history.length === 0) return;

    // Could add an Alert confirmation here
    clearHistory();
  };

  const handleActionPress = (action: ApprovalAction) => {
    router.push(`/approval/${action.id}`);
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      {/* Stats */}
      <View className="flex-row px-4 pt-4 pb-2 gap-3">
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">Total</Text>
          <Text className="text-white text-2xl font-bold mt-1">{history.length}</Text>
        </View>
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">Approved</Text>
          <Text className="text-green-500 text-2xl font-bold mt-1">
            {history.filter((a) => a.status === "approved").length}
          </Text>
        </View>
        <View className="flex-1 bg-zinc-900 rounded-xl p-4">
          <Text className="text-zinc-500 text-xs uppercase tracking-wide">Rejected</Text>
          <Text className="text-red-500 text-2xl font-bold mt-1">
            {history.filter((a) => a.status === "rejected").length}
          </Text>
        </View>
      </View>

      {/* History List */}
      <FlatList<ApprovalAction>
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: ApprovalAction }) => (
          <View className="px-4">
            <HistoryCard action={item} onPress={() => handleActionPress(item)} />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-6 mt-20">
            <View className="w-16 h-16 bg-zinc-900 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">📜</Text>
            </View>
            <Text className="text-white text-lg font-semibold mb-2">No history yet</Text>
            <Text className="text-zinc-500 text-base text-center">
              Your approved and rejected actions{"\n"}will appear here.
            </Text>
          </View>
        }
      />

      {/* Clear History Button */}
      {history.length > 0 && (
        <View className="absolute bottom-8 left-6 right-6">
          <TouchableOpacity
            onPress={handleClearHistory}
            className="bg-red-500/20 rounded-xl py-4 items-center border border-red-500/30"
            activeOpacity={0.7}
          >
            <Text className="text-red-500 font-semibold text-base">Clear History</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-zinc-950/90 border-t border-zinc-800 flex-row justify-around py-4 px-6">
        <TouchableOpacity className="items-center" onPress={navigateBack} activeOpacity={0.7}>
          <Text className="text-zinc-500 text-2xl mb-1">📋</Text>
          <Text className="text-zinc-500 text-xs">Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" activeOpacity={0.7}>
          <Text className="text-white text-2xl mb-1">📜</Text>
          <Text className="text-white text-xs font-medium">History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/settings")}
          activeOpacity={0.7}
        >
          <Text className="text-zinc-500 text-2xl mb-1">⚙️</Text>
          <Text className="text-zinc-500 text-xs">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
