package com.expense.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Flag
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
fun AddGoalSheet(
    onDismiss: () -> Unit,
    onSave: (name: String, targetAmount: Double, currentAmount: Double, deadline: String?) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var targetAmount by remember { mutableStateOf("") }
    var currentAmount by remember { mutableStateOf("") }
    var deadline by remember { mutableStateOf("") }

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
            Text("Tạo mục tiêu tiết kiệm 🎯", fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(bottom = 20.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Tên mục tiêu (VD: Mua xe máy)") },
                leadingIcon = { Icon(Icons.Rounded.Flag, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = targetAmount,
                onValueChange = { targetAmount = it.filter { c -> c.isDigit() || c == '.' } },
                label = { Text("Số tiền cần đạt (VND)") },
                leadingIcon = { Icon(Icons.Rounded.Payments, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = currentAmount,
                onValueChange = { currentAmount = it.filter { c -> c.isDigit() || c == '.' } },
                label = { Text("Số tiền hiện có (tuỳ chọn)") },
                leadingIcon = { Icon(Icons.Rounded.Payments, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = deadline,
                onValueChange = { deadline = it },
                label = { Text("Hạn chót (yyyy-MM-dd)") },
                leadingIcon = { Icon(Icons.Rounded.CalendarMonth, null, tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                placeholder = { Text("2025-12-31") },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    val target = targetAmount.toDoubleOrNull() ?: 0.0
                    if (name.isNotBlank() && target > 0) {
                        onSave(name, target, currentAmount.toDoubleOrNull() ?: 0.0, deadline.ifBlank { null })
                        onDismiss()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
            ) {
                Text("Tạo mục tiêu", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
