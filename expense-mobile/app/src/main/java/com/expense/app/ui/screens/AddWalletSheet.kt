package com.expense.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalanceWallet
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expense.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddWalletSheet(
    onDismiss: () -> Unit,
    onSave: (name: String, balance: Double, type: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var balance by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("cash") }
    val walletTypes = listOf("cash" to "Tiền mặt", "bank" to "Ngân hàng", "ewallet" to "Ví điện tử", "investment" to "Đầu tư")

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
            Text("Thêm ví mới 👛", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold,
                modifier = Modifier.padding(bottom = 20.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Tên ví") },
                leadingIcon = { Icon(Icons.Rounded.AccountBalanceWallet, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = balance,
                onValueChange = { balance = it.filter { c -> c.isDigit() || c == '.' } },
                label = { Text("Số dư ban đầu (VND)") },
                leadingIcon = { Icon(Icons.Rounded.Payments, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            Text("Loại ví", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                walletTypes.forEach { (value, label) ->
                    FilterChip(
                        selected = selectedType == value,
                        onClick = { selectedType = value },
                        label = { Text(label, fontSize = 12.sp) },
                        shape = RoundedCornerShape(10.dp)
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        onSave(name, balance.toDoubleOrNull() ?: 0.0, selectedType)
                        onDismiss()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text("Tạo ví", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
