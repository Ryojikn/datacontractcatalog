# Correção do Problema de Navegação - Seguros

## 🐛 **Problema Identificado**

**Sintoma**: Ao navegar para `Seguros > Seguros Auto > Apólices Seguro Residencial`, estava renderizando a collection errada.

**Causa Raiz**: Mapeamento incorreto de contratos para collections na linha de atribuição.

---

## 🔧 **Correção Aplicada**

### **Problema no Mapeamento**:
```typescript
// ANTES (INCORRETO)
mockCollections[4].contracts = [mockDataContracts[5], mockDataContracts[6]]; // seguros-auto
mockCollections[5].contracts = [mockDataContracts[7]]; // seguros-residencial
```

### **Correção Implementada**:
```typescript
// DEPOIS (CORRETO)
mockCollections[4].contracts = [mockDataContracts[5], mockDataContracts[7]]; // seguros-auto (sinistros + processados)
mockCollections[5].contracts = [mockDataContracts[6]]; // seguros-residencial
```

---

## 📊 **Mapeamento Correto Final**

### **Collections de Seguros**:

#### **Collection: seguros-vida** (mockCollections[3])
- ✅ `mockDataContracts[4]` → `dc-seguros-vida-apolices` (Apólices Seguro de Vida)

#### **Collection: seguros-auto** (mockCollections[4])  
- ✅ `mockDataContracts[5]` → `dc-seguros-auto-sinistros` (Sinistros Seguro Auto)
- ✅ `mockDataContracts[7]` → `dc-seguros-auto-sinistros-processados` (Sinistros Processados)

#### **Collection: seguros-residencial** (mockCollections[5])
- ✅ `mockDataContracts[6]` → `dc-seguros-residencial-apolices` (Apólices Seguro Residencial)

---

## 🎯 **Ordem dos Contratos no Array**

Para referência futura:
- **[0]**: `dc-cartoes-transacoes`
- **[1]**: `dc-cartoes-clientes`
- **[2]**: `dc-debito-transacoes`
- **[3]**: `dc-prepago-transacoes`
- **[4]**: `dc-seguros-vida-apolices` ← Collection seguros-vida
- **[5]**: `dc-seguros-auto-sinistros` ← Collection seguros-auto
- **[6]**: `dc-seguros-residencial-apolices` ← Collection seguros-residencial
- **[7]**: `dc-seguros-auto-sinistros-processados` ← Collection seguros-auto
- **[8]**: `dc-consorcio-imoveis-grupos`
- **[9]**: `dc-consorcio-veiculos-participantes`
- **[10]**: `dc-investimentos-fundos-cotas`
- **[11]**: `dc-investimentos-renda-fixa-posicoes`
- **[12]**: `dc-cartoes-fraud-model`

---

## ✅ **Resultado**

Agora a navegação funciona corretamente:
- **Seguros > Seguros Vida** → Mostra `Apólices Seguro de Vida`
- **Seguros > Seguros Auto** → Mostra `Sinistros Seguro Auto` + `Sinistros Processados`
- **Seguros > Seguros Residencial** → Mostra `Apólices Seguro Residencial`

**Problema de navegação resolvido! 🚀**