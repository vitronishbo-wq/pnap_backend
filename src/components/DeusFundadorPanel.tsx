import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building,
  Users,
  Layers,
  LayoutGrid,
  MapPin,
  Trash2,
  Plus,
  AlertTriangle,
  FolderPlus,
  UserPlus,
  Database,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  Shield,
  Fingerprint,
  Crown,
  GitFork
} from "lucide-react";
import HierarchyConfigPanel from "./HierarchyConfigPanel";

interface DeusFundadorPanelProps {
  provinces: { name: string; code: string }[];
  prisons: any[];
  setPrisons: React.Dispatch<React.SetStateAction<any[]>>;
  operators: any[];
  setOperators: React.Dispatch<React.SetStateAction<any[]>>;
  organizationalUnits: any[];
  setOrganizationalUnits: React.Dispatch<React.SetStateAction<any[]>>;
  institutionalHierarchy: any;
  setInstitutionalHierarchy: React.Dispatch<React.SetStateAction<any>>;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string,
    targetId?: string,
    targetName?: string
  ) => void;
  currentOperator: any;
}

export default function DeusFundadorPanel({
  provinces,
  prisons,
  setPrisons,
  operators,
  setOperators,
  organizationalUnits,
  setOrganizationalUnits,
  institutionalHierarchy,
  setInstitutionalHierarchy,
  writeAuditLog,
  currentOperator
}: DeusFundadorPanelProps) {
  const [activeSection, setActiveSection] = useState<
    "overview" | "prisons" | "pavilions" | "blocks" | "cells" | "users" | "hierarchy"
  >("overview");

  // Selection states for hierarchies
  const [selectedPrisonId, setSelectedPrisonId] = useState<string>("");
  const [selectedPavilionId, setSelectedPavilionId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Notification states
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showNotification = (msg: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Counting dynamic records per province for the overview
  const provinceStats = useMemo(() => {
    return provinces.map((prov) => {
      const count = prisons.filter(
        (p) => p.location && p.location.split(",")[0].trim() === prov.name
      ).length;
      return {
        ...prov,
        establishmentCount: count
      };
    });
  }, [provinces, prisons]);

  // Selected entities for drill-downs
  const currentPrison = useMemo(() => {
    return prisons.find((p) => p.id === selectedPrisonId);
  }, [prisons, selectedPrisonId]);

  const currentPavilion = useMemo(() => {
    if (!currentPrison || !currentPrison.pavilions) return null;
    return currentPrison.pavilions.find((p: any) => p.id === selectedPavilionId);
  }, [currentPrison, selectedPavilionId]);

  const currentBlock = useMemo(() => {
    if (!currentPavilion || !currentPavilion.blocks) return null;
    return currentPavilion.blocks.find((b: any) => b.id === selectedBlockId);
  }, [currentPavilion, selectedBlockId]);

  // --- FORM STATES ---

  // 1. New Prison (Establishment)
  const [newPrisonName, setNewPrisonName] = useState("");
  const [newPrisonProvince, setNewPrisonProvince] = useState("Cabinda");
  const [newPrisonOfficialCap, setNewPrisonOfficialCap] = useState("500");
  const [newPrisonOperationalCap, setNewPrisonOperationalCap] = useState("600");

  // 2. New Pavilion
  const [newPavilionName, setNewPavilionName] = useState("");

  // 3. New Block
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockCapacity, setNewBlockCapacity] = useState("100");
  const [newBlockRiskLevel, setNewBlockRiskLevel] = useState("Médio");

  // 4. New Cell
  const [newCellName, setNewCellName] = useState("");
  const [newCellCapacity, setNewCellCapacity] = useState("8");

  // 5. New Operator (Utilizador)
  const [newOpName, setNewOpName] = useState("");
  const [newOpUsername, setNewOpUsername] = useState("");
  const [newOpPassword, setNewOpPassword] = useState("");
  const [newOpSigla, setNewOpSigla] = useState("");
  const [newOpRole, setNewOpRole] = useState("CHEFE_SEGURANCA");
  const [newOpLevel, setNewOpLevel] = useState<"NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT">("ESTABLISHMENT");
  const [newOpProvince, setNewOpProvince] = useState("Luanda");
  const [newOpPrisonId, setNewOpPrisonId] = useState("");

  // --- ACTIONS & MUTATIONS ---

  // Create Prison
  const handleCreatePrison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrisonName.trim()) {
      showNotification("O nome do estabelecimento é obrigatório.", "error");
      return;
    }

    const cleanName = newPrisonName.trim();
    if (prisons.some((p) => p.name.toLowerCase() === cleanName.toLowerCase())) {
      showNotification("Já existe um estabelecimento com este nome.", "error");
      return;
    }

    const freshId = `PRIS-${cleanName.replace(/\s+/g, "-").slice(0, 15).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const freshPrison = {
      id: freshId,
      name: cleanName,
      location: `${newPrisonProvince}, Angola`,
      officialCapacity: parseInt(newPrisonOfficialCap) || 200,
      operationalCapacity: parseInt(newPrisonOperationalCap) || 300,
      currentOccupancy: 0,
      riskBreakdown: { Baixo: 0, Médio: 0, Alto: 0, Máximo: 0 },
      pavilions: []
    };

    // Update main prison state
    setPrisons((prev) => [...prev, freshPrison]);

    // Update institutional hierarchy state dynamic mapping
    setInstitutionalHierarchy((prev: any) => {
      const copy = { ...prev };
      if (!copy[newPrisonProvince]) {
        copy[newPrisonProvince] = { directions: {} };
      }
      const dirName = `Direção Provincial do ${newPrisonProvince}`;
      if (!copy[newPrisonProvince].directions[dirName]) {
        copy[newPrisonProvince].directions[dirName] = [];
      }
      copy[newPrisonProvince].directions[dirName] = [
        ...copy[newPrisonProvince].directions[dirName],
        { id: freshId, name: cleanName }
      ];
      return copy;
    });

    // Create a dynamic organizational unit
    const freshOUId = `OU-MININT-${freshId}`;
    const freshOU = {
      id: freshOUId,
      name: `Comando Geral - ${cleanName}`,
      level: "ESTABLISHMENT" as const,
      prisonId: freshId,
      province: newPrisonProvince
    };
    setOrganizationalUnits((prev) => [...prev, freshOU]);

    // Write audit log
    writeAuditLog(
      currentOperator,
      "PRISON_CREATE",
      "Prisons",
      freshId,
      `MOLOQUE SUPREMO: Estabelecimento Penitenciário ${cleanName} criado dinamicamente na província ${newPrisonProvince}.`
    );

    showNotification(`Estabelecimento "${cleanName}" criado com sucesso!`);
    setNewPrisonName("");
    setSelectedPrisonId(freshId);
  };

  // Delete Prison
  const handleDeletePrison = (prisonId: string) => {
    const prisonObj = prisons.find((p) => p.id === prisonId);
    if (!prisonObj) return;

    if (
      !confirm(
        `🚨 CORTE SUPREMO 🚨\nTem certeza absoluta de que deseja REVOGAR e EXCLUIR o estabelecimento:\n"${prisonObj.name}"?\nTodos os pavilhões, blocos e celas vinculados serão removidos do estado instantaneamente!`
      )
    ) {
      return;
    }

    setPrisons((prev) => prev.filter((p) => p.id !== prisonId));

    // Clear selected state
    if (selectedPrisonId === prisonId) {
      setSelectedPrisonId("");
      setSelectedPavilionId("");
      setSelectedBlockId("");
    }

    // Write audit log
    writeAuditLog(
      currentOperator,
      "PRISON_DELETE",
      "Prisons",
      prisonId,
      `EXCLUSÃO DEUS FUNDADOR: Estabelecimento Penitenciário ${prisonObj.name} e toda a sua infraestrutura foram desintegrados.`
    );

    showNotification(`Estabelecimento "${prisonObj.name}" foi apagado.`, "info");
  };

  // Create Pavilion
  const handleCreatePavilion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrisonId) {
      showNotification("Selecione primeiro o estabelecimento.", "error");
      return;
    }
    if (!newPavilionName.trim()) {
      showNotification("O nome do pavilhão é obrigatório.", "error");
      return;
    }

    const cleanName = newPavilionName.trim();
    const freshId = `PAV-${cleanName.replace(/\s+/g, "-").slice(0, 10).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          const pavilions = prison.pavilions ? [...prison.pavilions] : [];
          if (pavilions.some((p: any) => p.name.toLowerCase() === cleanName.toLowerCase())) {
            showNotification("Já existe um pavilhão com este nome.", "error");
            return prison;
          }
          return {
            ...prison,
            pavilions: [...pavilions, { id: freshId, name: cleanName, blocks: [] }]
          };
        }
        return prison;
      })
    );

    // Write audit log
    writeAuditLog(
      currentOperator,
      "PAVILION_CREATE",
      "Prisons",
      selectedPrisonId,
      `MOLOQUE SUPREMO: Pavilhão ${cleanName} criado dinamicamente no estabelecimento ${currentPrison?.name}.`
    );

    showNotification(`Pavilhão "${cleanName}" criado.`);
    setNewPavilionName("");
    setSelectedPavilionId(freshId);
  };

  // Delete Pavilion
  const handleDeletePavilion = (pavId: string) => {
    if (!selectedPrisonId) return;
    const pavObj = currentPrison?.pavilions.find((p: any) => p.id === pavId);
    if (!pavObj) return;

    if (!confirm(`Deseja mesmo apagar o pavilhão "${pavObj.name}"?`)) return;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          return {
            ...prison,
            pavilions: prison.pavilions.filter((p: any) => p.id !== pavId)
          };
        }
        return prison;
      })
    );

    if (selectedPavilionId === pavId) {
      setSelectedPavilionId("");
      setSelectedBlockId("");
    }

    writeAuditLog(
      currentOperator,
      "PAVILION_DELETE",
      "Prisons",
      selectedPrisonId,
      `EXCLUSÃO DEUS FUNDADOR: Pavilhão ${pavObj.name} do estabelecimento ${currentPrison?.name} excluído.`
    );

    showNotification(`Pavilhão "${pavObj.name}" removido.`, "info");
  };

  // Create Block
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrisonId || !selectedPavilionId) {
      showNotification("Selecione primeiro o estabelecimento e o pavilhão.", "error");
      return;
    }
    if (!newBlockName.trim()) {
      showNotification("O nome do bloco é obrigatório.", "error");
      return;
    }

    const cleanName = newBlockName.trim();
    const freshId = `BLK-${cleanName.replace(/\s+/g, "-").slice(0, 10).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          return {
            ...prison,
            pavilions: prison.pavilions.map((pav: any) => {
              if (pav.id === selectedPavilionId) {
                const blocks = pav.blocks ? [...pav.blocks] : [];
                if (blocks.some((b: any) => b.name.toLowerCase() === cleanName.toLowerCase())) {
                  showNotification("Já existe um bloco com este nome.", "error");
                  return pav;
                }
                return {
                  ...pav,
                  blocks: [
                    ...blocks,
                    {
                      id: freshId,
                      name: cleanName,
                      capacity: parseInt(newBlockCapacity) || 100,
                      current: 0,
                      cellCount: 0,
                      riskLevel: newBlockRiskLevel,
                      cells: []
                    }
                  ]
                };
              }
              return pav;
            })
          };
        }
        return prison;
      })
    );

    writeAuditLog(
      currentOperator,
      "BLOCK_CREATE",
      "Prisons",
      selectedPrisonId,
      `MOLOQUE SUPREMO: Bloco ${cleanName} criado no Pavilhão ${currentPavilion?.name}, Risco: ${newBlockRiskLevel}.`
    );

    showNotification(`Bloco "${cleanName}" adicionado.`);
    setNewBlockName("");
    setSelectedBlockId(freshId);
  };

  // Delete Block
  const handleDeleteBlock = (blockId: string) => {
    if (!selectedPrisonId || !selectedPavilionId) return;
    const blkObj = currentPavilion?.blocks.find((b: any) => b.id === blockId);
    if (!blkObj) return;

    if (!confirm(`Deseja mesmo apagar o bloco "${blkObj.name}"?`)) return;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          return {
            ...prison,
            pavilions: prison.pavilions.map((pav: any) => {
              if (pav.id === selectedPavilionId) {
                return {
                  ...pav,
                  blocks: pav.blocks.filter((b: any) => b.id !== blockId)
                };
              }
              return pav;
            })
          };
        }
        return prison;
      })
    );

    if (selectedBlockId === blockId) {
      setSelectedBlockId("");
    }

    writeAuditLog(
      currentOperator,
      "BLOCK_DELETE",
      "Prisons",
      selectedPrisonId,
      `EXCLUSÃO DEUS FUNDADOR: Bloco ${blkObj.name} do Pavilhão ${currentPavilion?.name} apagado.`
    );

    showNotification(`Bloco "${blkObj.name}" removido.`, "info");
  };

  // Create Cell (Cela)
  const handleCreateCell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrisonId || !selectedPavilionId || !selectedBlockId) {
      showNotification("Selecione estabelecimento, pavilhão e bloco.", "error");
      return;
    }
    if (!newCellName.trim()) {
      showNotification("O nome/número da cela é obrigatório (Ex: Cela C1-03).", "error");
      return;
    }

    const cleanName = newCellName.trim();
    const freshId = `CEL-${cleanName.replace(/\s+/g, "-").toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          return {
            ...prison,
            pavilions: prison.pavilions.map((pav: any) => {
              if (pav.id === selectedPavilionId) {
                return {
                  ...pav,
                  blocks: pav.blocks.map((blk: any) => {
                    if (blk.id === selectedBlockId) {
                      const cells = blk.cells ? [...blk.cells] : [];
                      if (cells.some((c: any) => c.name.toLowerCase() === cleanName.toLowerCase())) {
                        showNotification("Já existe uma cela com este nome neste bloco.", "error");
                        return blk;
                      }
                      return {
                        ...blk,
                        cellCount: (blk.cellCount || 0) + 1,
                        cells: [
                          ...cells,
                          {
                            id: freshId,
                            name: cleanName,
                            capacity: parseInt(newCellCapacity) || 8,
                            current: 0
                          }
                        ]
                      };
                    }
                    return blk;
                  })
                };
              }
              return pav;
            })
          };
        }
        return prison;
      })
    );

    writeAuditLog(
      currentOperator,
      "CELL_CREATE",
      "Prisons",
      selectedPrisonId,
      `MOLOQUE SUPREMO: Cela ${cleanName} com capacidade ${newCellCapacity} criada no Bloco ${currentBlock?.name}.`
    );

    showNotification(`Cela "${cleanName}" criada com sucesso.`);
    setNewCellName("");
  };

  // Delete Cell
  const handleDeleteCell = (cellId: string) => {
    if (!selectedPrisonId || !selectedPavilionId || !selectedBlockId) return;
    const cellObj = currentBlock?.cells?.find((c: any) => c.id === cellId);
    if (!cellObj) return;

    if (!confirm(`Deseja mesmo apagar a cela "${cellObj.name}"?`)) return;

    setPrisons((prev) =>
      prev.map((prison) => {
        if (prison.id === selectedPrisonId) {
          return {
            ...prison,
            pavilions: prison.pavilions.map((pav: any) => {
              if (pav.id === selectedPavilionId) {
                return {
                  ...pav,
                  blocks: pav.blocks.map((blk: any) => {
                    if (blk.id === selectedBlockId) {
                      return {
                        ...blk,
                        cellCount: Math.max(0, (blk.cellCount || 0) - 1),
                        cells: blk.cells.filter((c: any) => c.id !== cellId)
                      };
                    }
                    return blk;
                  })
                };
              }
              return pav;
            })
          };
        }
        return prison;
      })
    );

    writeAuditLog(
      currentOperator,
      "CELL_DELETE",
      "Prisons",
      selectedPrisonId,
      `EXCLUSÃO DEUS FUNDADOR: Cela ${cellObj.name} do bloco ${currentBlock?.name} removida.`
    );

    showNotification(`Cela "${cellObj.name}" removida.`, "info");
  };

  // Create Operator (Utilizador)
  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName.trim() || !newOpUsername.trim() || !newOpPassword.trim() || !newOpSigla.trim()) {
      showNotification("Nome, utilizador, senha e sigla militar são obrigatórios.", "error");
      return;
    }

    const cleanUsername = newOpUsername.trim().toLowerCase();
    if (operators.some((op) => op.username.toLowerCase() === cleanUsername)) {
      showNotification("Este nome de utilizador já está tomado.", "error");
      return;
    }

    const freshId = `MININT-OP-${newOpSigla.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    let calculatedRoleName = "Administrador Geral";
    let calculatedDesc = "Gestão global de todas as regiões e auditoria de mandatos prisionais.";
    if (newOpRole === "DIRECTOR_PROVINCIAL") {
      calculatedRoleName = `Diretor Provincial — ${newOpProvince}`;
      calculatedDesc = `Supervisão militar e outorgação na província de ${newOpProvince}.`;
    } else if (newOpRole === "DIRECTOR_CADEIA") {
      const matchPris = prisons.find((p) => p.id === newOpPrisonId);
      calculatedRoleName = "Diretor de Cadeia";
      calculatedDesc = `Autoridade militar e operacional máxima no estabelecimento ${matchPris?.name || "do Ministério"}.`;
    } else if (newOpRole === "CHEFE_SEGURANCA") {
      calculatedRoleName = "Chefe de Segurança Ativa";
      calculatedDesc = `Gestão das celas, transferências e segurança interna de custódias voluntárias.`;
    } else if (newOpRole === "CHEFE_SAUDE") {
      calculatedRoleName = "Chefe de Saúde e Clínica";
      calculatedDesc = `Supervisão médica clínica e prescrições de prontuários confidenciais.`;
    }

    const freshOperator = {
      id: freshId,
      name: newOpName.trim(),
      username: cleanUsername,
      senha_hash: newOpPassword,
      sigla: newOpSigla.trim().toUpperCase(),
      role: newOpRole,
      roleName: calculatedRoleName,
      roleDescription: calculatedDesc,
      level: newOpLevel,
      province: newOpLevel === "NATIONAL" ? undefined : newOpProvince,
      assignedPrisonId: newOpLevel === "ESTABLISHMENT" ? newOpPrisonId : undefined
    };

    setOperators((prev) => [...prev, freshOperator]);

    // Add another companion dynamic Organizational Unit if they are provincial and none exists
    if (newOpLevel === "PROVINCIAL") {
      if (!organizationalUnits.some((ou) => ou.province === newOpProvince)) {
        const freshOUProvId = `OU-MININT-PROV-${newOpProvince.toUpperCase().slice(0, 8)}`;
        const freshOUProv = {
          id: freshOUProvId,
          name: `Comando Provincial - ${newOpProvince}`,
          level: "PROVINCIAL" as const,
          province: newOpProvince
        };
        setOrganizationalUnits((prev) => [...prev, freshOUProv]);
      }
    }

    writeAuditLog(
      currentOperator,
      "USER_CREATE",
      "Users",
      freshId,
      `MOLOQUE SUPREMO: Novo operador criado: ${newOpName.trim()} (${newOpSigla.toUpperCase()}), cargo: ${calculatedRoleName}, nível: ${newOpLevel}.`
    );

    showNotification(`Utilizador "${newOpName.trim()}" criado com sucesso!`);
    // Reset form
    setNewOpName("");
    setNewOpUsername("");
    setNewOpPassword("");
    setNewOpSigla("");
  };

  // Delete Operator (Utilizador)
  const handleDeleteOperator = (opId: string) => {
    if (opId === "MININT-OP-DG-01" || opId === currentOperator.id) {
      showNotification("Não é permitido excluir o Diretor Geral Supremo ou a si mesmo.", "error");
      return;
    }

    const opObj = operators.find((op) => op.id === opId);
    if (!opObj) return;

    if (!confirm(`Deseja mesmo deletar o utilizador "${opObj.name}" (${opObj.username})?`)) return;

    setOperators((prev) => prev.filter((o) => o.id !== opId));

    writeAuditLog(
      currentOperator,
      "USER_DELETE",
      "Users",
      opId,
      `EXCLUSÃO DEUS FUNDADOR: Operador ${opObj.name} revogado e deletado do sistema.`
    );

    showNotification(`Operador "${opObj.name}" deletado.`, "info");
  };

  // Automated System Provisioning Utility for 21 Provinces (1 Pavilion, 1 Block, 3 Cells per province)
  const handleAutoProvision21Provinces = () => {
    const provincePrisonMap: Record<string, string> = {
      "Luanda": "EP/Viana",
      "Icolo e Bengo": "EP/Kakila",
      "Huambo": "EP/Cambiote",
      "Benguela": "EP/Cavaco",
      "Cabinda": "EP/Yabi",
      "Cuanza Norte": "EP/Kaporolo",
      "Cuanza Sul": "EP/Sumbe",
      "Cunene": "EP/Pebane",
      "Huíla": "EP/Bentiaba",
      "Namibe": "EP/Namibe",
      "Malanje": "EP/Banza do Bango",
      "Uíge": "EP/Uíge",
      "Zaire": "EP/Mbanza Kongo",
      "Lunda Norte": "EP/Kakanda",
      "Lunda Sul": "EP/Saurimo",
      "Moxico": "EP/Luena",
      "Moxico Leste": "EP/Moxico Leste",
      "Quando Cubango": "EP/Menongue",
      "Cuando": "EP/Cuando",
      "Bengo": "EP/Capolo",
      "Bié": "EP/Cuito"
    };

    setPrisons((prevPrisons) => {
      const updatedList = [...prevPrisons];

      provinces.forEach((prov) => {
        const canonicalPrisonName = provincePrisonMap[prov.name] || `EP ${prov.name}`;
        
        // Find if prison already exists for this province
        let pIndex = updatedList.findIndex((p) =>
          (p.location && p.location.toLowerCase().includes(prov.name.toLowerCase())) ||
          p.name.toLowerCase().includes(canonicalPrisonName.toLowerCase()) ||
          p.name.toLowerCase().includes(prov.name.toLowerCase())
        );

        let prisonObj: any;
        if (pIndex === -1) {
          // Create new prison if missing
          const freshId = `PRIS-${prov.code}-${Math.floor(100 + Math.random() * 900)}`;
          prisonObj = {
            id: freshId,
            name: canonicalPrisonName,
            location: `${prov.name}, Angola`,
            officialCapacity: 300,
            operationalCapacity: 350,
            currentOccupancy: 0,
            riskBreakdown: { Baixo: 0, Médio: 0, Alto: 0, Máximo: 0 },
            pavilions: []
          };
          updatedList.push(prisonObj);
          pIndex = updatedList.length - 1;
        } else {
          // Clone existing prison object
          prisonObj = { ...updatedList[pIndex] };
        }

        // Ensure Pavilions array exists
        const pavilionsList = prisonObj.pavilions ? [...prisonObj.pavilions] : [];

        // Ensure 1 Pavilion exists
        if (pavilionsList.length === 0) {
          pavilionsList.push({
            id: `PAV-${prov.code}-01`,
            name: `Pavilhão Central (${prov.name})`,
            blocks: []
          });
        }

        // Process Pavilions
        const updatedPavilions = pavilionsList.map((pav: any) => {
          const blocksList = pav.blocks ? [...pav.blocks] : [];

          // Ensure 1 Block exists
          if (blocksList.length === 0) {
            blocksList.push({
              id: `BLK-${prov.code}-A`,
              name: `Bloco A - Segurança Geral`,
              capacity: 100,
              current: 0,
              cellCount: 0,
              riskLevel: "Médio",
              cells: []
            });
          }

          // Process Blocks
          const updatedBlocks = blocksList.map((blk: any) => {
            const cellsList = blk.cells ? [...blk.cells] : [];

            // Ensure 3 Cells exist
            const cellNames = ["Cela C-01", "Cela C-02", "Cela C-03"];
            cellNames.forEach((cName, cIdx) => {
              const exists = cellsList.some((c: any) =>
                c.name.toLowerCase() === cName.toLowerCase() || c.name.includes(`C-0${cIdx + 1}`)
              );
              if (!exists) {
                cellsList.push({
                  id: `CEL-${prov.code}-0${cIdx + 1}`,
                  name: cName,
                  capacity: 8,
                  current: 0
                });
              }
            });

            return {
              ...blk,
              cellCount: cellsList.length,
              cells: cellsList
            };
          });

          return {
            ...pav,
            blocks: updatedBlocks
          };
        });

        prisonObj.pavilions = updatedPavilions;
        updatedList[pIndex] = prisonObj;
      });

      return updatedList;
    });

    writeAuditLog(
      currentOperator,
      "SYSTEM_AUTO_PROVISION",
      "Prisons",
      "PROVINCES_21_ALL",
      `UTILITÁRIO DE SISTEMA (SICP): Geração/Validação da hierarquia de 1 Pavilhão, 1 Bloco e 3 Celas para todas as 21 províncias de Angola.`
    );

    showNotification(
      `Sincronização concluída! 21 Províncias com 1 Pavilhão, 1 Bloco e 3 Celas garantidos.`
    );
  };

  // Filtered lists for rendering
  const filteredPrisons = prisons.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOperators = operators.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      key="deus-fundador-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6"
    >
      {/* Supreme Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 shrink-0">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5 leading-none">
              Gestão de Topologia & Estrutura (21 Províncias)
            </h2>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Controlo hierárquico nacional: Estabelecimentos, Pavilhões, Blocos e Celas.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleAutoProvision21Provinces}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 text-xs border border-amber-400 rounded-lg font-mono flex items-center gap-1.5 font-extrabold cursor-pointer transition shadow-lg shadow-amber-500/10 active:scale-95"
            title="Criar/Sincronizar Estrutura Automática (1 Pavilhão, 1 Bloco e 3 Celas em cada uma das 21 Províncias)"
          >
            <FolderPlus className="h-4 w-4" />
            ⚡ GERAR ESTRUTURA (21 PROVÍNCIAS)
          </button>
          <span className="bg-slate-950 text-amber-500 px-2.5 py-1 text-[10px] border border-amber-500/20 rounded-lg font-mono flex items-center gap-1.5 font-bold">
            <Fingerprint className="h-3.5 w-3.5" /> ATIVO
          </span>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`p-3 rounded-lg border text-xxs font-semibold font-mono flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : notification.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Grid containing Tab Selector and Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column menu */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <button
            onClick={() => {
              setActiveSection("overview");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "overview"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Sliders className="h-4 w-4" />
            1. Quadro de Províncias DPA 2024
          </button>

          <button
            onClick={() => {
              setActiveSection("prisons");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "prisons"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Building className="h-4 w-4" />
            2. Estabelecimentos Penitenciários
          </button>

          <button
            onClick={() => {
              setActiveSection("pavilions");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "pavilions"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Layers className="h-4 w-4" />
            3. Pavilhões Prisionais
          </button>

          <button
            onClick={() => {
              setActiveSection("blocks");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "blocks"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            4. Blocos Penitenciários
          </button>

          <button
            onClick={() => {
              setActiveSection("cells");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "cells"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Database className="h-4 w-4" />
            5. Celas Operacionais
          </button>

          <button
            onClick={() => {
              setActiveSection("users");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "users"
                ? "bg-amber-500/10 border-amber-500/60 text-amber-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <Users className="h-4 w-4" />
            6. Utilizadores & Operadores
          </button>

          <button
            onClick={() => {
              setActiveSection("hierarchy");
              setSearchTerm("");
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans text-xs font-bold leading-none ${
              activeSection === "hierarchy"
                ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300 shadow-md"
                : "bg-slate-950/60 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
            }`}
          >
            <GitFork className="h-4 w-4 text-indigo-400" />
            7. Hierarquia Orgânica (Sub-Níveis)
          </button>

          <div className="mt-4 p-4 rounded-xl border border-slate-850 bg-slate-950 font-mono text-[9.5px] leading-relaxed text-slate-500 flex flex-col gap-1.5">
            <span className="text-amber-500/80 font-bold uppercase tracking-wider block mb-1">Dica do Deus Fundador:</span>
            <p>
              Qualquer alteração feita neste painel afeta o estado global. Novas cadeias tornam-se disponíveis para alocação, novos blocos para admissão, e novos operadores para simulador instantaneamente.
            </p>
          </div>
        </div>

        {/* Right column content */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
          
          {/* SECTION 1: OVERVIEW OF 21 PROVINCES (IMMUTABLE RECORD HEAD) */}
          {activeSection === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-amber-500" /> DPA 2024 — Províncias de Angola (Fontes de Verdade Imutáveis)
                  </h3>
                  <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
                    As 21 Províncias Oficiais sob a nova Divisão Político-Administrativa de Angola (2024).
                  </p>
                </div>

                <button
                  onClick={handleAutoProvision21Provinces}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-mono font-black rounded-xl border border-amber-400 flex items-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/10 active:scale-95 shrink-0"
                >
                  <FolderPlus className="h-4 w-4" />
                  Gera/Sincronizar Estrutura (21 Províncias)
                </button>
              </div>

              {/* System Utility Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wide">
                      Utilitário de Resiliência de Dados & Hierarquia Canónica
                    </h4>
                    <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                      Garante que cada uma das <strong>21 Províncias de Angola</strong> possui a estrutura mínima obrigatória: <strong>1 Estabelecimento Penitenciário</strong>, <strong>1 Pavilhão</strong>, <strong>1 Bloco</strong> e <strong>3 Celas</strong> (Hierarquia Pai-Filho-Neto).
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAutoProvision21Provinces}
                  className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono rounded-lg transition border border-amber-300 shrink-0 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  Executar Auto-Provisionamento
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {provinceStats.map((prov) => (
                  <div
                    key={prov.name}
                    className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex flex-col justify-between gap-2.5 group hover:border-amber-500/30 transition-all cursor-default"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-sans font-bold text-slate-200 group-hover:text-amber-400 transition-all truncate">
                        {prov.name}
                      </span>
                      <span className="text-[8.5px] font-mono bg-slate-900 font-extrabold px-1.5 rounded text-amber-500 border border-slate-850">
                        {prov.code}
                      </span>
                    </div>
                    {/* Active Establishments counter */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
                      <span>Estabelecimentos:</span>
                      <strong className={`font-bold ${prov.establishmentCount > 0 ? "text-amber-500 font-extrabold" : "text-slate-600"}`}>
                        {prov.establishmentCount}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: ESTABELECIMENTOS PENITENCIÁRIOS (CRUD) */}
          {activeSection === "prisons" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Form column */}
                <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-sans font-bold text-xxs text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <FolderPlus className="h-3.5 w-3.5 text-amber-500" /> Registar Estabelecimento
                  </h4>
                  
                  <form onSubmit={handleCreatePrison} className="flex flex-col gap-3 font-mono text-xxs">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400">NOME DO ESTABELECIMENTO:</label>
                      <input
                        type="text"
                        value={newPrisonName}
                        onChange={(e) => setNewPrisonName(e.target.value)}
                        placeholder="Ex: EP de Cabinda-Sul"
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xxs block w-full focus:border-amber-500/50"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400">PROVÍNCIA REGIMENTAL (DPA 2024):</label>
                      <select
                        value={newPrisonProvince}
                        onChange={(e) => setNewPrisonProvince(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xxs block w-full focus:border-amber-500/50"
                        required
                      >
                        {provinces.map((prov) => (
                          <option key={prov.name} value={prov.name}>
                            {prov.name} ({prov.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">CAPAC. OFICIAL:</label>
                        <input
                          type="number"
                          value={newPrisonOfficialCap}
                          onChange={(e) => setNewPrisonOfficialCap(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xxs block w-full focus:border-amber-500/50"
                          min="50"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">CAPAC. OPERACIONAL:</label>
                        <input
                          type="number"
                          value={newPrisonOperationalCap}
                          onChange={(e) => setNewPrisonOperationalCap(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xxs block w-full focus:border-amber-500/50"
                          min="50"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1 shadow-md hover:shadow-amber-500/10"
                    >
                      <Plus className="h-4 w-4 shrink-0" /> Criar Prisão
                    </button>
                  </form>
                </div>

                {/* List column */}
                <div className="md:col-span-8 flex flex-col gap-3">
                  <div className="flex justify-between items-center-wrap gap-2">
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-amber-500" /> Infraestrutura Disponível ({filteredPrisons.length})
                    </h3>
                    <input
                      type="text"
                      placeholder="Pesquisar cadeias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xxs text-slate-350 font-mono outline-none focus:border-amber-550/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto pr-1">
                    {filteredPrisons.map((pr) => (
                      <div
                        key={pr.id}
                        className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all ${
                          selectedPrisonId === pr.id
                            ? "bg-slate-950 border-amber-500 ring-1 ring-amber-500/20"
                            : "bg-slate-950 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col gap-1 w-2/3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-sans text-slate-200">{pr.name}</span>
                            <span className="text-[7.5px] font-mono bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-slate-400 font-bold uppercase truncate">
                              ID: {pr.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 leading-none">
                            <MapPin className="h-3 w-3 text-red-500 shrink-0" /> {pr.location || "Região Governamental"}
                          </span>
                          <div className="flex gap-4 font-mono text-[9px] text-slate-500 mt-2">
                            <span>Oficial: <strong className="text-slate-350">{pr.officialCapacity}</strong></span>
                            <span>Operacional: <strong className="text-slate-350">{pr.operationalCapacity}</strong></span>
                            <span>População: <strong className="text-amber-500">{pr.currentOccupancy || 0}</strong></span>
                            <span>Pavilhões: <strong className="text-slate-350">{pr.pavilions?.length || 0}</strong></span>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPrisonId(pr.id);
                              setSelectedPavilionId("");
                              setSelectedBlockId("");
                              setActiveSection("pavilions");
                            }}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-500 hover:text-amber-400 text-xxs font-bold py-1.5 px-2 rounded cursor-pointer transition-all uppercase leading-none"
                          >
                            Ver Pavilhões
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrison(pr.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded cursor-pointer transition-all"
                            title="Apagar estabelecimento prisional"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: PAVILHÕES (CRUD) */}
          {activeSection === "pavilions" && (
            <div className="flex flex-col gap-5">
              {/* Select Prison header */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Selecionar Estabelecimento Prisional:</label>
                  <select
                    value={selectedPrisonId}
                    onChange={(e) => {
                      setSelectedPrisonId(e.target.value);
                      setSelectedPavilionId("");
                      setSelectedBlockId("");
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                  >
                    <option value="">Selecione...</option>
                    {prisons.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name} ({pr.location?.split(",")[0] || "Sem Local"})
                      </option>
                    ))}
                  </select>
                </div>
                {currentPrison && (
                  <div className="text-xxs font-mono text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-850 flex flex-col gap-1 font-semibold leading-relaxed shrink-0">
                    <div>Infraestrutura: <span className="text-amber-500">{currentPrison.name}</span></div>
                    <div>Capacidade Operacional Cadastrada: <span className="text-slate-350">{currentPrison.operationalCapacity} reclusos</span></div>
                  </div>
                )}
              </div>

              {selectedPrisonId ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Form Pavilion */}
                  <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="font-sans font-bold text-xxs text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FolderPlus className="h-3.5 w-3.5 text-amber-500" /> Registar Novo Pavilhão
                    </h4>
                    <form onSubmit={handleCreatePavilion} className="flex flex-col gap-3 font-mono text-xxs">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">NOME DO PAVILHÃO:</label>
                        <input
                          type="text"
                          value={newPavilionName}
                          onChange={(e) => setNewPavilionName(e.target.value)}
                          placeholder="Ex: Pavilhão D - Regime Semi-Aberto"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4 shrink-0" /> Adicionar Pavilhão
                      </button>
                    </form>
                  </div>

                  {/* List Pavilion */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-amber-500" /> Pavilhões Registados em "{currentPrison?.name}"
                    </h3>

                    {currentPrison?.pavilions && currentPrison.pavilions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto">
                        {currentPrison.pavilions.map((pav: any) => (
                          <div
                            key={pav.id}
                            className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                              selectedPavilionId === pav.id
                                ? "bg-slate-950 border-amber-500 ring-1 ring-amber-500/10"
                                : "bg-slate-950 border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-200 font-sans">{pav.name}</span>
                              <span className="text-[7.5px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.2 rounded w-fit mt-0.5">
                                ID: {pav.id} | Blocos Adquiridos: {pav.blocks?.length || 0}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPavilionId(pav.id);
                                  setSelectedBlockId("");
                                  setActiveSection("blocks");
                                }}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-500 hover:text-amber-400 text-xxs font-bold py-1.5 px-2 rounded cursor-pointer transition-all uppercase"
                              >
                                Ver Blocos
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePavilion(pav.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 text-xxs">
                        Nenhum pavilhão construído para este estabelecimento. Crie um no formulário ao lado.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-400 text-xs font-mono">
                  Por favor, escolha uma infraestrutura acima para carregar o seu registro de pavilhões.
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: BLOCOS (CRUD) */}
          {activeSection === "blocks" && (
            <div className="flex flex-col gap-5">
              {/* Select Prison / Pavilion Header */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Estabelecimento:</label>
                  <select
                    value={selectedPrisonId}
                    onChange={(e) => {
                      setSelectedPrisonId(e.target.value);
                      setSelectedPavilionId("");
                      setSelectedBlockId("");
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                  >
                    <option value="">Selecione...</option>
                    {prisons.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPrisonId && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Pavilhão:</label>
                    <select
                      value={selectedPavilionId}
                      onChange={(e) => {
                        setSelectedPavilionId(e.target.value);
                        setSelectedBlockId("");
                      }}
                      className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                    >
                      <option value="">Selecione...</option>
                      {currentPrison?.pavilions?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedPrisonId && selectedPavilionId ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Form Block */}
                  <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="font-sans font-bold text-xxs text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FolderPlus className="h-3.5 w-3.5 text-amber-500" /> Registar Novo Bloco
                    </h4>
                    <form onSubmit={handleCreateBlock} className="flex flex-col gap-3 font-mono text-xxs">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">NOME DO BLOCO:</label>
                        <input
                          type="text"
                          value={newBlockName}
                          onChange={(e) => setNewBlockName(e.target.value)}
                          placeholder="Ex: Bloco D1"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">CAPACIDADE DO BLOCO (RECLUSOS):</label>
                        <input
                          type="number"
                          value={newBlockCapacity}
                          onChange={(e) => setNewBlockCapacity(e.target.value)}
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          min="10"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">NÍVEL DE SEGURANÇA E RISCO:</label>
                        <select
                          value={newBlockRiskLevel}
                          onChange={(e) => setNewBlockRiskLevel(e.target.value)}
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        >
                          <option value="Baixo">Baixo (Mínima Vigilância)</option>
                          <option value="Médio">Médio (Padrão Operacional)</option>
                          <option value="Alto">Alto (Regime Fechado Especial)</option>
                          <option value="Máximo">Máximo (Alta Segurança Integrada)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4 shrink-0" /> Adicionar Bloco
                      </button>
                    </form>
                  </div>

                  {/* List Block */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4 text-amber-500" /> Blocos Registados no Pavilhão "{currentPavilion?.name}"
                    </h3>

                    {currentPavilion?.blocks && currentPavilion.blocks.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto">
                        {currentPavilion.blocks.map((blk: any) => (
                          <div
                            key={blk.id}
                            className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                              selectedBlockId === blk.id
                                ? "bg-slate-950 border-amber-500 ring-1 ring-amber-500/10"
                                : "bg-slate-950 border-slate-850 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex flex-col gap-1 w-2/3">
                              <span className="text-xs font-bold text-slate-200 font-sans">{blk.name}</span>
                              <span className="text-[7.5px] font-mono uppercase bg-slate-900 border border-slate-850 text-slate-500 px-1.5 py-0.2 rounded w-fit my-0.5">
                                ID: {blk.id} | Nível: {blk.riskLevel}
                              </span>
                              <div className="flex gap-4 font-mono text-[9px] text-slate-500 mt-1">
                                <span>Capacidade: <strong className="text-slate-350">{blk.capacity}</strong></span>
                                <span>Ocupados: <strong className="text-slate-350">{blk.current || 0}</strong></span>
                                <span>Celas Detalhadas: <strong className="text-slate-350">{blk.cells?.length || blk.cellCount || 0}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBlockId(blk.id);
                                  setActiveSection("cells");
                                }}
                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-500 hover:text-amber-400 text-xxs font-bold py-1.5 px-2 rounded cursor-pointer transition-all uppercase"
                              >
                                Ver Celas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlock(blk.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 text-xxs">
                        Nenhum bloco mapeado neste pavilhão. Crie um no formulário ao lado.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-400 text-xs font-mono">
                  Selecione o estabelecimento de custódia e o pavilhão correspondente para ver ou adicionar blocos.
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: CELAS (CRUD) */}
          {activeSection === "cells" && (
            <div className="flex flex-col gap-5">
              {/* Select Prison / Pavilion / Block header */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Estabelecimento:</label>
                  <select
                    value={selectedPrisonId}
                    onChange={(e) => {
                      setSelectedPrisonId(e.target.value);
                      setSelectedPavilionId("");
                      setSelectedBlockId("");
                    }}
                    className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                  >
                    <option value="">Selecione...</option>
                    {prisons.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPrisonId && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Pavilhão:</label>
                    <select
                      value={selectedPavilionId}
                      onChange={(e) => {
                        setSelectedPavilionId(e.target.value);
                        setSelectedBlockId("");
                      }}
                      className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                    >
                      <option value="">Selecione...</option>
                      {currentPrison?.pavilions?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedPrisonId && selectedPavilionId && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Bloco:</label>
                    <select
                      value={selectedBlockId}
                      onChange={(e) => setSelectedBlockId(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 font-sans font-bold cursor-pointer outline-none focus:border-amber-500/50"
                    >
                      <option value="">Selecione...</option>
                      {currentPavilion?.blocks?.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedPrisonId && selectedPavilionId && selectedBlockId ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  
                  {/* Form Cell */}
                  <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="font-sans font-bold text-xxs text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FolderPlus className="h-3.5 w-3.5 text-amber-500" /> Registar Nova Cela
                    </h4>
                    <form onSubmit={handleCreateCell} className="flex flex-col gap-3 font-mono text-xxs">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">NOME/NÚMERO DA CELA:</label>
                        <input
                          type="text"
                          value={newCellName}
                          onChange={(e) => setNewCellName(e.target.value)}
                          placeholder="Ex: Cela A1-08"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">CAPACIDADE MÁXIMA DA CELA:</label>
                        <input
                          type="number"
                          value={newCellCapacity}
                          onChange={(e) => setNewCellCapacity(e.target.value)}
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          min="1"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4 shrink-0" /> Adicionar Cela
                      </button>
                    </form>
                  </div>

                  {/* List Cell */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="h-4 w-4 text-amber-500" /> Celas Detalhadas no Bloco "{currentBlock?.name}"
                    </h3>

                    {currentBlock?.cells && currentBlock.cells.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
                        {currentBlock.cells.map((cel: any) => (
                          <div
                            key={cel.id}
                            className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between group hover:border-slate-800 transition-all font-sans"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11.5px] font-bold text-slate-200">{cel.name}</span>
                              <span className="text-[8.5px] text-slate-400 font-mono font-medium leading-none mt-0.5">
                                Capacidade: <strong className="text-amber-500 font-bold">{cel.capacity}</strong> | Atuais: <strong className="text-slate-300 font-bold">{cel.current || 0}</strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCell(cel.id)}
                              className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded cursor-pointer transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-500 text-[11px] font-mono leading-relaxed">
                        Nenhuma cela registrada dinamicamente neste bloco. Celas virtuais automáticas de ID 1 a 8 serão associadas aleatoriamente nas admissões se nenhuma cela customizada for criada.
                        <div className="mt-2 text-slate-650 text-[10px] text-slate-400">
                          Use o painel ao lado para registrar celas específicas com suas limitações de vagas na cela física.
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-10 border border-dashed border-slate-850 rounded-xl text-center text-slate-400 text-xs font-mono">
                  Defina o estabelecimento de custódia, o pavilhão e o bloco correspondente para mapear as celas individuais.
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: UTILIZADORES / OPERATORS (CRUD) */}
          {activeSection === "users" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Form Operators */}
                <div className="md:col-span-5 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                  <h4 className="font-sans font-bold text-xxs text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4 text-amber-500" /> Registar Novo Operador Militar
                  </h4>
                  <form onSubmit={handleCreateOperator} className="flex flex-col gap-3 font-mono text-xxs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">NOME DO OFICIAL:</label>
                        <input
                          type="text"
                          value={newOpName}
                          onChange={(e) => setNewOpName(e.target.value)}
                          placeholder="Ex: Manuel Neto"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">PATENTE/SIGLA MILITAR:</label>
                        <input
                          type="text"
                          value={newOpSigla}
                          onChange={(e) => setNewOpSigla(e.target.value)}
                          placeholder="Ex: MJ-NETO"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">UTILIZADOR (LOGIN):</label>
                        <input
                          type="text"
                          value={newOpUsername}
                          onChange={(e) => setNewOpUsername(e.target.value)}
                          placeholder="Ex: mneto"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">SENHA:</label>
                        <input
                          type="text"
                          value={newOpPassword}
                          onChange={(e) => setNewOpPassword(e.target.value)}
                          placeholder="Ex: neto123"
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400">CARGO PENAL DO OPERADOR:</label>
                      <select
                        value={newOpRole}
                        onChange={(e) => {
                          const r = e.target.value;
                          setNewOpRole(r);
                          if (r === "DIRECTOR_GERAL") setNewOpLevel("NATIONAL");
                          else if (r === "DIRECTOR_PROVINCIAL") setNewOpLevel("PROVINCIAL");
                          else setNewOpLevel("ESTABLISHMENT");
                        }}
                        className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full focus:border-amber-500/50"
                        required
                      >
                        <option value="DIRECTOR_GERAL">Diretor Geral Supremo (Nacional)</option>
                        <option value="DIRECTOR_PROVINCIAL">Diretor Provincial (Provincial)</option>
                        <option value="DIRECTOR_CADEIA">Diretor de Cadeia (Estabelecimento)</option>
                        <option value="CHEFE_SEGURANCA">Chefe de Segurança Ativa (Estabelecimento)</option>
                        <option value="CHEFE_SAUDE">Chefe de Saúde Prisional (Estabelecimento)</option>
                      </select>
                    </div>

                    {newOpLevel === "PROVINCIAL" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-400">PROVÍNCIA DESIGNADA:</label>
                        <select
                          value={newOpProvince}
                          onChange={(e) => setNewOpProvince(e.target.value)}
                          className="bg-slate-900 border border-slate-800 p-2 text-slate-200 text-xxs rounded block w-full"
                          required
                        >
                          {provinces.map((prov) => (
                            <option key={prov.name} value={prov.name}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {newOpLevel === "ESTABLISHMENT" && (
                      <div className="flex flex-col gap-1 animate-fadeIn">
                        <label className="text-slate-400">ESTABELECIMENTO DESIGNADO:</label>
                        <select
                          value={newOpPrisonId}
                          onChange={(e) => setNewOpPrisonId(e.target.value)}
                          className="bg-slate-900 border border-slate-800 p-2 text-xs text-slate-200 rounded block w-full font-bold cursor-pointer outline-none"
                          required
                        >
                          <option value="">Selecione a cadeia...</option>
                          {prisons.map((pr) => (
                            <option key={pr.id} value={pr.id}>
                              {pr.name} ({pr.location?.split(",")[0] || "Sem Região"})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="text-[9.5px] text-slate-500 font-mono bg-slate-900 p-2.5 rounded border border-slate-850 uppercase leading-relaxed font-semibold">
                      ATRIBUÍDO AUTOMATICAMENTE: Nível {newOpLevel} {newOpLevel !== "NATIONAL" ? `no Escopo Policial de ${newOpLevel === "PROVINCIAL" ? newOpProvince : "Estabelecimento"}` : ""}.
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 rounded cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                    >
                      <UserPlus className="h-4 w-4 shrink-0" /> Criar Operador
                    </button>
                  </form>
                </div>

                {/* List Operators */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  <div className="flex justify-between items-center-wrap gap-2">
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-500" /> Operadores de Sistema Cadastrados ({filteredOperators.length})
                    </h3>
                    <input
                      type="text"
                      placeholder="Pesquisar operadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xxs text-slate-350 font-mono outline-none focus:border-amber-550/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[440px] overflow-y-auto pr-1">
                    {filteredOperators.map((op) => {
                      const isSelf = op.id === currentOperator.id;
                      const isFounderDG = op.id === "MININT-OP-DG-01";

                      return (
                        <div
                          key={op.id}
                          className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between transition-all hover:border-slate-800"
                        >
                          <div className="flex flex-col gap-1 w-2/3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200 font-sans">{op.name}</span>
                              <span className="text-[7.5px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-400 px-1.5 rounded font-extrabold tracking-wider shrink-0">
                                {op.sigla}
                              </span>
                            </div>
                            <span className="text-amber-500 text-[10px] font-semibold mt-0.5 leading-none">
                              {op.roleName}
                            </span>
                            <span className="text-[9.5px] text-slate-400 mt-1 truncate">
                              Escopo: {op.level} | User: <strong className="text-slate-300 font-mono">{op.username}</strong> | Senha: <strong className="text-slate-500 font-mono select-all leading-relaxed">{op.senha_hash}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isSelf && (
                              <span className="text-[8px] bg-sky-950/40 text-sky-400 font-bold px-2 py-1.5 rounded-lg border border-sky-500/20 uppercase font-mono tracking-wider">
                                Ativo (Você)
                              </span>
                            )}
                            {!isSelf && !isFounderDG ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteOperator(op.id)}
                                className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded cursor-pointer transition-all"
                                title="Revogar operador militar"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            ) : (
                              isFounderDG && (
                                <span className="text-[8.5px] bg-amber-950/40 text-amber-500 font-bold px-2 py-1.5 rounded-lg border border-amber-500/20 uppercase font-mono">
                                  Supremo
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 7: ORGANIZATIONAL HIERARCHY SUBLEVELS CONFIGURATION */}
          {activeSection === "hierarchy" && (
            <HierarchyConfigPanel
              provinces={provinces}
              prisons={prisons}
              setPrisons={setPrisons}
              operators={operators}
              organizationalUnits={organizationalUnits}
              setOrganizationalUnits={setOrganizationalUnits}
              institutionalHierarchy={institutionalHierarchy}
              setInstitutionalHierarchy={setInstitutionalHierarchy}
              writeAuditLog={writeAuditLog}
              currentOperator={currentOperator}
            />
          )}

        </div>

      </div>
    </motion.div>
  );
}
