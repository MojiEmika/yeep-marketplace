// B01–B04 ค้นหา กรอง และเรียงลำดับ
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListingCard from '../components/ListingCard';
import { Button, Chip, EmptyState, Field, Icon } from '../components/ui';
import { useApp, useRequireAuth } from '../context/AppContext';
import { colors, font, radius, shadow, spacing } from '../theme';

const SORTS = [
  { id: 'newest', name: 'ใหม่ล่าสุด' },
  { id: 'price_asc', name: 'ราคาต่ำ → สูง' },
  { id: 'price_desc', name: 'ราคาสูง → ต่ำ' },
];

const EMPTY_FILTERS = { conditions: [], zone: null, minPrice: '', maxPrice: '', includeSold: false };

export default function SearchScreen({ navigation, route }) {
  const { listings, categories, conditions, meetupSpots, getSpot, toggleFavorite } = useApp();
  const requireAuth = useRequireAuth(navigation);
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draft, setDraft] = useState(EMPTY_FILTERS); // ค่าที่ยังไม่กด "ใช้ตัวกรอง"
  const [panel, setPanel] = useState(null); // 'filters' | 'sort' | null

  // รับค่าจากหน้าแรก เช่น กดหมวดหมู่ หรือกดช่องค้นหา
  useEffect(() => {
    const p = route.params || {};
    if (p.categoryId !== undefined) setCategoryId(p.categoryId);
    if (p.maxPrice !== undefined) {
      setFilters((f) => ({ ...f, maxPrice: p.maxPrice, minPrice: '' }));
    }
    if (p.focus) setTimeout(() => inputRef.current?.focus(), 300);
  }, [route.params]);

  const zones = useMemo(() => [...new Set(meetupSpots.map((s) => s.zone))], [meetupSpots]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Infinity;
    const list = listings.filter((l) => {
      if (l.status === 'paused') return false;
      if (!filters.includeSold && l.status === 'sold') return false;
      if (categoryId && l.categoryId !== categoryId) return false;
      if (q && !`${l.title} ${l.description} ${l.brand || ''}`.toLowerCase().includes(q)) return false;
      if (filters.conditions.length && !filters.conditions.includes(l.condition)) return false;
      if (filters.zone && !l.meetupSpotIds.some((id) => getSpot(id)?.zone === filters.zone)) return false;
      if (l.price < min || l.price > max) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [listings, query, categoryId, filters, sort, getSpot]);

  const activeFilterCount =
    filters.conditions.length + (filters.zone ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.includeSold ? 1 : 0);

  const priceError =
    draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)
      ? 'ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด'
      : null;

  const clearAll = () => {
    setQuery('');
    setCategoryId(null);
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
  };

  const toggleDraftCondition = (id) =>
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.includes(id) ? d.conditions.filter((c) => c !== id) : [...d.conditions, id],
    }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Icon name="search-outline" size={20} color={colors.muted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหา เช่น เสื้อช็อป, พัดลม, ชีท"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="ล้างคำค้นหา">
              <Icon name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
          <Chip label="ทั้งหมด" selected={!categoryId} onPress={() => setCategoryId(null)} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              icon={c.icon}
              selected={categoryId === c.id}
              onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.toolbar}>
          <Text style={font.small}>พบ {results.length} รายการ</Text>
          <View style={{ flexDirection: 'row' }}>
            <Chip
              icon="options-outline"
              label={`ตัวกรอง${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
              selected={activeFilterCount > 0}
              onPress={() => {
                setDraft(filters);
                setPanel('filters');
              }}
              style={{ marginBottom: 0 }}
            />
            <Chip
              icon="swap-vertical-outline"
              label={SORTS.find((s) => s.id === sort).name}
              onPress={() => setPanel('sort')}
              style={{ marginBottom: 0, marginRight: 0 }}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            width={cardWidth}
            onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            onToggleFavorite={() => requireAuth(() => toggleFavorite(item.id))}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="ไม่พบสินค้าที่ตรงกับการค้นหา"
            subtitle="ลองเปลี่ยนคำค้นหา หรือล้างตัวกรอง"
            actionLabel="ล้างทั้งหมด"
            onAction={clearAll}
          />
        }
      />

      {/* B03 แผงตัวกรอง */}
      <Modal visible={panel === 'filters'} animationType="slide" transparent onRequestClose={() => setPanel(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={font.h3}>ตัวกรอง</Text>
              <Pressable onPress={() => setPanel(null)} hitSlop={8} accessibilityLabel="ปิด">
                <Icon name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.groupLabel}>สภาพสินค้า</Text>
              <View style={styles.wrap}>
                {conditions.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    selected={draft.conditions.includes(c.id)}
                    onPress={() => toggleDraftCondition(c.id)}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>โซนนัดรับ</Text>
              <View style={styles.wrap}>
                {zones.map((z) => (
                  <Chip
                    key={z}
                    label={z}
                    selected={draft.zone === z}
                    onPress={() => setDraft((d) => ({ ...d, zone: d.zone === z ? null : z }))}
                  />
                ))}
              </View>

              <Text style={styles.groupLabel}>ช่วงราคา (บาท)</Text>
              <View style={{ flexDirection: 'row' }}>
                <Field
                  placeholder="ต่ำสุด"
                  keyboardType="number-pad"
                  value={draft.minPrice}
                  onChangeText={(t) => setDraft((d) => ({ ...d, minPrice: t.replace(/\D/g, '') }))}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <Field
                  placeholder="สูงสุด"
                  keyboardType="number-pad"
                  value={draft.maxPrice}
                  onChangeText={(t) => setDraft((d) => ({ ...d, maxPrice: t.replace(/\D/g, '') }))}
                  style={{ flex: 1 }}
                />
              </View>
              {priceError ? <Text style={styles.error}>{priceError}</Text> : null}

              <View style={styles.wrap}>
                <Chip
                  label="แสดงสินค้าที่ขายแล้วด้วย"
                  selected={draft.includeSold}
                  onPress={() => setDraft((d) => ({ ...d, includeSold: !d.includeSold }))}
                />
              </View>
            </ScrollView>
            <View style={styles.sheetFooter}>
              <Button title="ล้าง" variant="secondary" onPress={() => setDraft(EMPTY_FILTERS)} style={{ flex: 1, marginRight: spacing.sm }} />
              <Button
                title="ใช้ตัวกรอง"
                disabled={!!priceError}
                onPress={() => {
                  setFilters(draft);
                  setPanel(null);
                }}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* B04 เรียงลำดับ */}
      <Modal visible={panel === 'sort'} animationType="slide" transparent onRequestClose={() => setPanel(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPanel(null)}>
          <View style={styles.sheet}>
            <Text style={[font.h3, { marginBottom: spacing.md }]}>เรียงตาม</Text>
            {SORTS.map((s) => (
              <Pressable
                key={s.id}
                style={styles.sortRow}
                onPress={() => {
                  setSort(s.id);
                  setPanel(null);
                }}
              >
                <Text style={[font.body, sort === s.id && { fontWeight: '700' }]}>{s.name}</Text>
                {sort === s.id ? <Icon name="checkmark" size={20} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.cream },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: spacing.sm, fontSize: 15, color: colors.text },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '85%',
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sheetFooter: { flexDirection: 'row', marginTop: spacing.md },
  groupLabel: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: colors.danger, fontSize: 13, marginTop: -spacing.sm, marginBottom: spacing.sm },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
