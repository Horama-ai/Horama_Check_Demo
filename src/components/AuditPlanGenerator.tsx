import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Check,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileImage,
  ClipboardCheck,
  Shield,
  Eye,
  Layout,
  Target,
  CheckCircle2,
  ArrowRight,
  Edit3,
  Save,
} from 'lucide-react';
import type { Zone, Checkpoint, Audit, Stage } from '../types';

interface AuditPlanGeneratorProps {
  stage: Stage;
  onClose: () => void;
  onGenerate: (audit: Audit) => void;
}

interface AIStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'completed';
}

// Zone types with labels and icons
const zoneTypeConfig: Record<Zone['type'], { label: string; icon: React.ReactNode; color: string }> = {
  entrance: { label: 'Entrée', icon: <Target className="w-4 h-4" />, color: 'blue' },
  exit: { label: 'Sortie', icon: <ArrowRight className="w-4 h-4" />, color: 'emerald' },
  pathway: { label: 'Cheminement', icon: <MapPin className="w-4 h-4" />, color: 'amber' },
  sensitive: { label: 'Zone sensible', icon: <Shield className="w-4 h-4" />, color: 'rose' },
  barrier: { label: 'Barriérage', icon: <Layout className="w-4 h-4" />, color: 'purple' },
  signage: { label: 'Signalétique', icon: <Eye className="w-4 h-4" />, color: 'cyan' },
  general: { label: 'Zone générale', icon: <Layout className="w-4 h-4" />, color: 'gray' },
};

export function AuditPlanGenerator({ stage, onClose, onGenerate }: AuditPlanGeneratorProps) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiSteps, setAiSteps] = useState<AIStep[]>([]);
  const [generatedZones, setGeneratedZones] = useState<Zone[]>([]);
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingCheckpoint, setEditingCheckpoint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAnalyzing = useRef(false);

  // AI analysis steps
  const initialAiSteps: AIStep[] = [
    { id: 'upload', label: 'Réception du plan', icon: <FileImage className="w-4 h-4" />, status: 'pending' },
    { id: 'analyze', label: 'Analyse de la structure du village', icon: <Eye className="w-4 h-4" />, status: 'pending' },
    { id: 'zones', label: 'Repérage des zones stratégiques', icon: <MapPin className="w-4 h-4" />, status: 'pending' },
    { id: 'checkpoints', label: 'Identification des points de contrôle', icon: <ClipboardCheck className="w-4 h-4" />, status: 'pending' },
    { id: 'cispe', label: 'Application de l\'expertise Cispé', icon: <Shield className="w-4 h-4" />, status: 'pending' },
    { id: 'criteria', label: 'Définition des critères d\'audit', icon: <Target className="w-4 h-4" />, status: 'pending' },
    { id: 'optimize', label: 'Optimisation du parcours d\'audit', icon: <Layout className="w-4 h-4" />, status: 'pending' },
    { id: 'finalize', label: 'Génération du plan d\'audit', icon: <Sparkles className="w-4 h-4" />, status: 'pending' },
  ];

  // Generate synthetic zones based on "AI analysis"
  const generateSyntheticZones = (): Zone[] => {
    const createCheckpoint = (zoneId: string, idx: number, desc: string, criteria: string): Checkpoint => ({
      id: `${zoneId}-cp-${idx}`,
      zoneId,
      category: 'Contrôle',
      description: desc,
      criteria,
      status: 'pending',
    });

    return [
      {
        id: 'gen-z1',
        name: 'Entrée Principale - Accès Public',
        shortName: 'Entrée Principale',
        type: 'entrance',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 6,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z1', 1, 'Signalétique directionnelle visible', 'Panneaux visibles à 10m minimum'),
          createCheckpoint('gen-z1', 2, 'Cheminement dégagé', 'Largeur min. 2m, sans obstacle'),
          createCheckpoint('gen-z1', 3, 'Barriérage en place', 'Barrières continues et stables'),
          createCheckpoint('gen-z1', 4, 'Point de contrôle identifiable', 'Zone de filtrage clairement délimitée'),
          createCheckpoint('gen-z1', 5, 'Accessibilité PMR', 'Rampe et signalétique PMR présentes'),
          createCheckpoint('gen-z1', 6, 'Zone d\'attente délimitée', 'File d\'attente organisée'),
        ],
      },
      {
        id: 'gen-z2',
        name: 'Entrée Secondaire - Accès VIP',
        shortName: 'Entrée VIP',
        type: 'entrance',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 5,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z2', 1, 'Signalétique VIP visible', 'Indication claire "Accès VIP"'),
          createCheckpoint('gen-z2', 2, 'Contrôle d\'accès en place', 'Badge ou liste requis pour entrée'),
          createCheckpoint('gen-z2', 3, 'Cheminement prioritaire', 'Parcours dédié sans file'),
          createCheckpoint('gen-z2', 4, 'Zone d\'accueil présente', 'Espace d\'accueil identifié'),
          createCheckpoint('gen-z2', 5, 'Éclairage fonctionnel', 'Éclairage suffisant sur toute la zone'),
        ],
      },
      {
        id: 'gen-z3',
        name: 'Zone Village - Espace Partenaires',
        shortName: 'Village',
        type: 'general',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 10,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z3', 1, 'Plan d\'implantation respecté', 'Stands positionnés selon plan'),
          createCheckpoint('gen-z3', 2, 'Allées principales dégagées', 'Largeur min. 3m maintenue'),
          createCheckpoint('gen-z3', 3, 'Signalétique stands visible', 'Identification claire des partenaires'),
          createCheckpoint('gen-z3', 4, 'Points info présents', 'Bornes info aux carrefours'),
          createCheckpoint('gen-z3', 5, 'Poubelles en nombre suffisant', '1 poubelle / 50m²'),
          createCheckpoint('gen-z3', 6, 'Extincteurs visibles', '1 extincteur visible / zone'),
          createCheckpoint('gen-z3', 7, 'Issues de secours accessibles', 'Accès non obstrués'),
          createCheckpoint('gen-z3', 8, 'Câblage sécurisé', 'Câbles protégés ou enterrés'),
          createCheckpoint('gen-z3', 9, 'Sanitaires accessibles', 'Fléchage vers sanitaires'),
          createCheckpoint('gen-z3', 10, 'Zone fumeur délimitée', 'Espace fumeur identifié'),
        ],
      },
      {
        id: 'gen-z4',
        name: 'Sortie Principale',
        shortName: 'Sortie',
        type: 'exit',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 5,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z4', 1, 'Signalétique sortie visible', 'Panneaux "Sortie" visibles'),
          createCheckpoint('gen-z4', 2, 'Cheminement dégagé', 'Largeur min. 3m pour flux sortant'),
          createCheckpoint('gen-z4', 3, 'Barriérage canalisateur', 'Flux dirigé vers points de sortie'),
          createCheckpoint('gen-z4', 4, 'Zone tampon suffisante', 'Espace de dispersion extérieur'),
          createCheckpoint('gen-z4', 5, 'Comptage possible', 'Point de comptage accessible'),
        ],
      },
      {
        id: 'gen-z5',
        name: 'Cheminement Public - Axe Central',
        shortName: 'Axe Central',
        type: 'pathway',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 5,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z5', 1, 'Largeur conforme', 'Min. 4m pour flux bidirectionnel'),
          createCheckpoint('gen-z5', 2, 'Sol praticable', 'Surface plane et stable'),
          createCheckpoint('gen-z5', 3, 'Signalétique directionnelle', 'Fléchage aux intersections'),
          createCheckpoint('gen-z5', 4, 'Éclairage continu', 'Éclairage sur tout le parcours'),
          createCheckpoint('gen-z5', 5, 'Points de repère', 'Repères visuels identifiables'),
        ],
      },
      {
        id: 'gen-z6',
        name: 'Zone Technique - Backstage',
        shortName: 'Backstage',
        type: 'sensitive',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 5,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z6', 1, 'Accès restreint signalé', 'Panneau "Zone Technique"'),
          createCheckpoint('gen-z6', 2, 'Contrôle d\'accès en place', 'Badge requis pour entrée'),
          createCheckpoint('gen-z6', 3, 'Issues de secours dégagées', 'Sorties non obstruées'),
          createCheckpoint('gen-z6', 4, 'Matériel stocké correctement', 'Pas d\'encombrement'),
          createCheckpoint('gen-z6', 5, 'Extincteurs accessibles', 'Extincteurs visibles et accessibles'),
        ],
      },
      {
        id: 'gen-z7',
        name: 'Barriérage Périmétrique',
        shortName: 'Périmètre',
        type: 'barrier',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 4,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z7', 1, 'Continuité du barriérage', 'Aucune brèche visible'),
          createCheckpoint('gen-z7', 2, 'Stabilité des barrières', 'Barrières solidement fixées'),
          createCheckpoint('gen-z7', 3, 'Hauteur conforme', 'Min. 1.10m de hauteur'),
          createCheckpoint('gen-z7', 4, 'Points de passage contrôlés', 'Ouvertures uniquement aux accès'),
        ],
      },
      {
        id: 'gen-z8',
        name: 'Signalétique Générale',
        shortName: 'Signalétique',
        type: 'signage',
        status: 'pending',
        completedChecks: 0,
        totalChecks: 6,
        issues: 0,
        checkpoints: [
          createCheckpoint('gen-z8', 1, 'Plan général visible', 'Plan à chaque entrée'),
          createCheckpoint('gen-z8', 2, 'Fléchage toilettes', 'Directions vers sanitaires'),
          createCheckpoint('gen-z8', 3, 'Fléchage points d\'eau', 'Directions vers fontaines'),
          createCheckpoint('gen-z8', 4, 'Fléchage secours', 'Directions vers poste secours'),
          createCheckpoint('gen-z8', 5, 'Fléchage sorties', 'Directions vers sorties'),
          createCheckpoint('gen-z8', 6, 'Information programme', 'Horaires et activités affichés'),
        ],
      },
    ];
  };

  // Handle file upload
  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setStep('analyzing');
        setAiSteps(initialAiSteps);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // Simulate AI analysis with sequential steps - 3 seconds each
  useEffect(() => {
    if (step === 'analyzing' && aiSteps.length > 0 && !isAnalyzing.current) {
      isAnalyzing.current = true;

      const runAnalysis = async () => {
        for (let i = 0; i < aiSteps.length; i++) {
          // Set current step to loading
          setAiSteps(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'loading' } : s
          ));

          // Wait 3 seconds
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Set current step to completed
          setAiSteps(prev => prev.map((s, idx) =>
            idx === i ? { ...s, status: 'completed' } : s
          ));
        }

        // All done - wait a moment then show results
        await new Promise(resolve => setTimeout(resolve, 500));
        setGeneratedZones(generateSyntheticZones());
        setStep('review');
        isAnalyzing.current = false;
      };

      runAnalysis();
    }
  }, [step, aiSteps.length]);

  // Zone management functions
  const addZone = () => {
    const newId = `gen-z${generatedZones.length + 1}-${Date.now()}`;
    const newZone: Zone = {
      id: newId,
      name: 'Nouvelle zone',
      shortName: 'Nouvelle',
      type: 'general',
      status: 'pending',
      completedChecks: 0,
      totalChecks: 0,
      issues: 0,
      checkpoints: [],
    };
    setGeneratedZones([...generatedZones, newZone]);
    setExpandedZoneId(newId);
    setEditingZone(newId);
  };

  const removeZone = (zoneId: string) => {
    setGeneratedZones(generatedZones.filter(z => z.id !== zoneId));
  };

  const updateZone = (zoneId: string, updates: Partial<Zone>) => {
    setGeneratedZones(generatedZones.map(z =>
      z.id === zoneId ? { ...z, ...updates, totalChecks: updates.checkpoints?.length ?? z.totalChecks } : z
    ));
  };

  const addCheckpoint = (zoneId: string) => {
    const zone = generatedZones.find(z => z.id === zoneId);
    if (!zone) return;

    const newCpId = `${zoneId}-cp-${zone.checkpoints.length + 1}-${Date.now()}`;
    const newCheckpoint: Checkpoint = {
      id: newCpId,
      zoneId,
      category: 'Contrôle',
      description: 'Nouveau point de contrôle',
      criteria: 'À définir',
      status: 'pending',
    };

    updateZone(zoneId, {
      checkpoints: [...zone.checkpoints, newCheckpoint],
    });
    setEditingCheckpoint(newCpId);
  };

  const removeCheckpoint = (zoneId: string, checkpointId: string) => {
    const zone = generatedZones.find(z => z.id === zoneId);
    if (!zone) return;

    updateZone(zoneId, {
      checkpoints: zone.checkpoints.filter(cp => cp.id !== checkpointId),
    });
  };

  const updateCheckpoint = (zoneId: string, checkpointId: string, updates: Partial<Checkpoint>) => {
    const zone = generatedZones.find(z => z.id === zoneId);
    if (!zone) return;

    updateZone(zoneId, {
      checkpoints: zone.checkpoints.map(cp =>
        cp.id === checkpointId ? { ...cp, ...updates } : cp
      ),
    });
  };

  // Generate final audit
  const handleGenerate = () => {
    const totalChecks = generatedZones.reduce((acc, z) => acc + z.checkpoints.length, 0);

    const audit: Audit = {
      id: `audit-${stage.id}`,
      stageId: stage.id,
      name: `Village Départ - ${stage.name}`,
      location: stage.location,
      date: stage.date,
      status: 'pending',
      zones: generatedZones.map(z => ({
        ...z,
        totalChecks: z.checkpoints.length,
      })),
      issues: [],
      completedChecks: 0,
      totalChecks,
      passRate: 0,
    };

    onGenerate(audit);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg lg:text-xl font-medium text-gray-900">Planifier le plan d'audit</h2>
            <p className="text-sm text-gray-500 mt-0.5">{stage.name} • {stage.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Upload Step */}
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 lg:p-8"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Générer automatiquement le plan d'audit</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                    Déposez le plan du village et notre IA génèrera automatiquement les zones et points de contrôle selon l'expertise Cispé.
                  </p>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <Upload className={`w-10 h-10 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-blue-600">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, PDF jusqu'à 10MB</p>
                </div>
              </motion.div>
            )}

            {/* Analyzing Step */}
            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 lg:p-8"
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Image Preview */}
                  <div className="lg:w-1/2">
                    <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden relative">
                      {uploadedImage && (
                        <img
                          src={uploadedImage}
                          alt="Plan du village"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-sm font-medium">Plan du village</p>
                        <p className="text-white/70 text-xs">{stage.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Steps */}
                  <div className="lg:w-1/2">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Analyse IA en cours</h3>
                    </div>
                    <div className="space-y-2">
                      {aiSteps.map((aiStep, index) => (
                        <motion.div
                          key={aiStep.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            aiStep.status === 'completed'
                              ? 'bg-emerald-50'
                              : aiStep.status === 'loading'
                                ? 'bg-blue-50'
                                : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            aiStep.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : aiStep.status === 'loading'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-200 text-gray-400'
                          }`}>
                            {aiStep.status === 'completed' ? (
                              <Check className="w-4 h-4" />
                            ) : aiStep.status === 'loading' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              aiStep.icon
                            )}
                          </div>
                          <span className={`text-sm ${
                            aiStep.status === 'completed'
                              ? 'text-emerald-700'
                              : aiStep.status === 'loading'
                                ? 'text-blue-700 font-medium'
                                : 'text-gray-500'
                          }`}>
                            {aiStep.label}
                          </span>
                          {aiStep.status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 lg:p-6"
              >
                {/* Summary */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">{generatedZones.length} zones</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">
                      {generatedZones.reduce((acc, z) => acc + z.checkpoints.length, 0)} points de contrôle
                    </span>
                  </div>
                  <button
                    onClick={addZone}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors ml-auto"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">Ajouter une zone</span>
                  </button>
                </div>

                {/* Zones List */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {generatedZones.map((zone) => {
                    const config = zoneTypeConfig[zone.type];
                    const isExpanded = expandedZoneId === zone.id;
                    const isEditing = editingZone === zone.id;

                    return (
                      <div
                        key={zone.id}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Zone Header */}
                        <div
                          className={`p-3 lg:p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isExpanded ? 'bg-gray-50' : ''
                          }`}
                          onClick={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-${config.color}-600`}>{config.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <input
                                type="text"
                                value={zone.name}
                                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => setEditingZone(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingZone(null)}
                                className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1"
                                autoFocus
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-900 truncate">{zone.name}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs text-${config.color}-600 font-medium`}>{config.label}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{zone.checkpoints.length} contrôles</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingZone(zone.id); }}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeZone(zone.id); }}
                              className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Zone Checkpoints */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-100 overflow-hidden"
                            >
                              <div className="p-3 lg:p-4 bg-gray-50 space-y-2">
                                {/* Zone Type Selector */}
                                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-200">
                                  {(Object.keys(zoneTypeConfig) as Zone['type'][]).map((type) => {
                                    const typeConfig = zoneTypeConfig[type];
                                    const isSelected = zone.type === type;
                                    return (
                                      <button
                                        key={type}
                                        onClick={() => updateZone(zone.id, { type })}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isSelected
                                            ? `bg-${typeConfig.color}-100 text-${typeConfig.color}-700`
                                            : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                      >
                                        {typeConfig.icon}
                                        {typeConfig.label}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Checkpoints */}
                                {zone.checkpoints.map((checkpoint, idx) => {
                                  const isEditingCp = editingCheckpoint === checkpoint.id;
                                  return (
                                    <div
                                      key={checkpoint.id}
                                      className="flex items-start gap-3 p-3 bg-white rounded-xl"
                                    >
                                      <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                                        {idx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        {isEditingCp ? (
                                          <div className="space-y-2">
                                            <input
                                              type="text"
                                              value={checkpoint.description}
                                              onChange={(e) => updateCheckpoint(zone.id, checkpoint.id, { description: e.target.value })}
                                              className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"
                                              placeholder="Description"
                                            />
                                            <input
                                              type="text"
                                              value={checkpoint.criteria}
                                              onChange={(e) => updateCheckpoint(zone.id, checkpoint.id, { criteria: e.target.value })}
                                              className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1"
                                              placeholder="Critère"
                                            />
                                            <button
                                              onClick={() => setEditingCheckpoint(null)}
                                              className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg text-xs"
                                            >
                                              <Save className="w-3 h-3" />
                                              Enregistrer
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <p className="text-sm text-gray-900">{checkpoint.description}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{checkpoint.criteria}</p>
                                          </>
                                        )}
                                      </div>
                                      {!isEditingCp && (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => setEditingCheckpoint(checkpoint.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                                          </button>
                                          <button
                                            onClick={() => removeCheckpoint(zone.id, checkpoint.id)}
                                            className="p-1.5 hover:bg-rose-100 rounded-lg transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Add Checkpoint Button */}
                                <button
                                  onClick={() => addCheckpoint(zone.id)}
                                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  Ajouter un point de contrôle
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step === 'review' && (
          <div className="p-4 lg:p-6 border-t border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Générer le plan d'audit
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
