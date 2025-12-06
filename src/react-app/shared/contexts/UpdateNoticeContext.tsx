import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useConfig } from '../lib/useConfig';

interface UpdateNoticeContextValue {
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  version: string;
  latestVersion?: string;
}

const STORAGE_KEY = 'last_seen_app_version';

const UpdateNoticeContext = createContext<UpdateNoticeContextValue | undefined>(undefined);

type ParsedChangelog = {
  version: string;
  sections: {
    Added?: string[];
    Changed?: string[];
    Fixed?: string[];
    Removed?: string[];
    [key: string]: string[] | undefined;
  };
};

function parseChangelog(text: string): ParsedChangelog[] {
  const lines = text.split('\n');
  const result: ParsedChangelog[] = [];
  let current: ParsedChangelog | null = null;
  let currentSection: string | null = null;

  const flush = () => {
    if (current) result.push(current);
  };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      flush();
      current = { version: line.replace(/^##\s+/, ''), sections: {} };
      currentSection = null;
    } else if (line.startsWith('### ')) {
      if (!current) return;
      currentSection = line.replace(/^###\s+/, '').replace(/:$/, '');
      if (!current.sections[currentSection]) current.sections[currentSection] = [];
    } else if (line.startsWith('- ')) {
      if (!current) return;
      const target = currentSection || 'Other';
      if (!current.sections[target]) current.sections[target] = [];
      current.sections[target]!.push(line.replace(/^-+\s*/, '').trim());
    }
  });
  flush();
  return result;
}

export const UpdateNoticeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config } = useConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [parsedLog, setParsedLog] = useState<ParsedChangelog[]>([]);

  const version = useMemo(() => 'dev', []);
  const latestVersion = parsedLog[0]?.version || version;

  // 從外部來源載入 CHANGELOG（預設 /CHANGELOG.md，可用 VITE_CHANGELOG_URL 覆寫）
  useEffect(() => {
    const changelogUrl = import.meta.env.VITE_CHANGELOG_URL || '/CHANGELOG.md';
    fetch(changelogUrl)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (!text) return;
        const parsed = parseChangelog(text);
        if (parsed.length) setParsedLog([parsed[0]]); // 只顯示第一個版本區塊
      })
      .catch((error) => {
        console.warn('Failed to fetch CHANGELOG.md', error);
      });
  }, []);

  useEffect(() => {
    if (!version) return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== version) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to read update notice status', error);
    }
  }, [version]);

  const closeUpdateModal = () => {
    setIsOpen(false);
    try {
      if (version) {
        localStorage.setItem(STORAGE_KEY, version);
      }
    } catch (error) {
      console.error('Failed to persist update notice status', error);
    }
  };

  const openUpdateModal = () => setIsOpen(true);

  const tagStyles: Record<string, { bg: string; text: string }> = {
    Added: { bg: '#0E8A16', text: '#ffffff' },
    Changed: { bg: '#1D76DB', text: '#ffffff' },
    Fixed: { bg: '#ce181e', text: '#ffffff' },
    Removed: { bg: '#F9D0C4', text: '#7f1d1d' },
  };

  return (
    <UpdateNoticeContext.Provider value={{ openUpdateModal, closeUpdateModal, version: latestVersion, latestVersion }}>
      {children}
      <Modal isOpen={isOpen} onClose={closeUpdateModal} title={parsedLog[0] ? `更新日誌 v${parsedLog[0].version}` : '更新日誌'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {parsedLog.map((entry) => (
            <div key={entry.version} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <div className="space-y-3">
                {Object.entries(entry.sections).map(([section, items]) => {
                  if (!items || !items.length) return null;
                  const style = tagStyles[section] || { bg: '#e5e7eb', text: '#374151' };
                  return (
                    <div key={`${entry.version}-${section}`} className="space-y-1">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        {section}
                      </span>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {items.map((item, idx) => (
                          <li key={`${entry.version}-${section}-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </UpdateNoticeContext.Provider>
  );
};

export const useUpdateNotice = () => {
  const ctx = useContext(UpdateNoticeContext);
  if (!ctx) {
    console.warn('useUpdateNotice used without provider');
    return {
      openUpdateModal: () => undefined,
      closeUpdateModal: () => undefined,
      version: 'dev',
      latestVersion: undefined,
    };
  }
  return ctx;
};
