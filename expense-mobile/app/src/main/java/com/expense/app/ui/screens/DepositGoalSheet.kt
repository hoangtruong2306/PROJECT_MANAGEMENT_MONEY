package com.expense.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.data.model.Goal
import com.expense.app.ui.theme.*
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DepositGoalSheet(
    goal: Goal,
    onDismiss: () -> Unit,
    onDeposit: (amount: Double) -> Unit
) {
    var amount by remember { mutableStateOf("") }
    val fmt = NumberFormat.getNumberInstance(Locale("vi", "VN"))
    val remaining = goal.target_amount - goal.current_amount

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 40.dp)
        ) {
            Text("Nạp tiền vào mục tiêu 💰", fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(bottom = 8.dp))

            Text(
                "🎯 ${goal.name}",
                fontSize = 14.sp, color = PrimaryGreen, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 4.dp)
            )
            Text(
                "Còn thiếu: ${fmt.format(remaining.coerceAtLeast(0.0))} đ",
                fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 20.dp)
            )

            OutlinedTextField(
                value = amount,
                onValueChange = { amount = it.filter { c -> c.isDigit() || c == '.' } },
                label = { Text("Số tiền nạp (VND)") },
                leadingIcon = { Icon(Icons.Rounded.Payments, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    val amt = amount.toDoubleOrNull() ?: 0.0
                    if (amt > 0) {
                        onDeposit(amt)
                        onDismiss()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SuccessMint)
            ) {
                Text("Nạp tiền", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
