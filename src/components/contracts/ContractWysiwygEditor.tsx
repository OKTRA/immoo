import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
  Save,
  FileText,
  Users,
  Calendar,
  Building,
  Download,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Minus as MinusIcon,
  Plus as PlusIcon,
  File
} from 'lucide-react';
import { toast } from 'sonner';
import { formatContractText } from '@/utils/contractFormatting';
import './ContractEditor.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

interface ContractWysiwygEditorProps {
  initialContent?: string;
  contractId?: string;
  onSave?: (content: string, metadata: ContractMetadata) => void;
  onAssignToLease?: (contractId: string, leaseId: string) => void;
  availableLeases?: Array<{ id: string; title: string; tenantName: string; propertyName: string }>;
  isReadOnly?: boolean;
  showToolbar?: boolean;
}

interface ContractMetadata {
  title: string;
  type: string;
  jurisdiction: string;
  parties: Record<string, any>;
  details: Record<string, any>;
  status: 'draft' | 'validated' | 'signed' | 'archived';
  assignedLeaseId?: string;
}

const ContractWysiwygEditor: React.FC<ContractWysiwygEditorProps> = ({
  initialContent = '',
  contractId,
  onSave,
  onAssignToLease,
  availableLeases = [],
  isReadOnly = false,
  showToolbar = true
}) => {
  const [metadata, setMetadata] = useState<ContractMetadata>({
    title: '',
    type: 'bail',
    jurisdiction: 'Côte d\'Ivoire',
    parties: {},
    details: {},
    status: 'draft'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);

  const isNewContract = !contractId || contractId === 'new';

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Commencez à rédiger votre contrat...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
    ],
    content: formatContractText(initialContent),
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      // Auto-save functionality could be added here
    },
  });

  const setLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const MenuBar = () => {
    if (!editor || !showToolbar) {
      return null;
    }

    return (
      <div className="border-b border-gray-200 bg-white p-4 space-y-4">
        {/* Formatting Tools */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('underline') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('strike') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={editor.isActive('bulletList') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('orderedList') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('blockquote') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive('codeBlock') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={setLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Heading Levels */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Titre:</span>
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      // Utiliser les métadonnées par défaut si elles ne sont pas fournies
      const defaultMetadata = {
        title: metadata.title || 'Contrat',
        type: metadata.type || 'bail',
        jurisdiction: metadata.jurisdiction || 'Côte d\'Ivoire',
        parties: metadata.parties || {},
        details: metadata.details || {},
        status: metadata.status || 'draft'
      };
      await onSave?.(content, defaultMetadata);
      toast.success('Contrat sauvegardé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction utilitaire pour générer un nom de fichier propre
  const generateFileName = (extension: string): string => {
    const contractTitle = metadata.title || 'Contrat';
    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
    const cleanTitle = contractTitle
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50); // Limiter la longueur
    
    return `${cleanTitle}_${date}.${extension}`;
  };

  const handleAssignToLease = async () => {
    if (!selectedLeaseId || !contractId) return;
    
    try {
      await onAssignToLease?.(contractId, selectedLeaseId);
      setShowAssignDialog(false);
      setSelectedLeaseId('');
      toast.success('Contrat attribué au bail avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'attribution');
    }
  };

  const exportToPDF = async () => {
    if (!editor) return;
    
    setIsExportingPDF(true);
    try {
      toast.info('Génération du PDF optimisé...');
      
      // Créer un PDF avec du texte natif (plus léger)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let currentY = margin;
      
      pdf.setFont('times');
      
      // Fonction pour ajouter une nouvelle page si nécessaire
      const checkPageBreak = (needed: number) => {
        if (currentY + needed > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
      };
      
      // Fonction pour traiter le texte et l'ajouter au PDF
      const addTextToPDF = (text: string, fontSize: number, style: string = 'normal', align: string = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('times', style);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.4;
        
        checkPageBreak(lines.length * lineHeight);
        
        lines.forEach((line: string) => {
          const alignX = align === 'center' ? pageWidth / 2 : 
                       align === 'right' ? pageWidth - margin : margin;
          
          pdf.text(line, alignX, currentY, { align: align as any });
          currentY += lineHeight;
        });
        
        currentY += lineHeight * 0.5; // Espacement après
      };
      
      // Parser le HTML pour extraire le contenu
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.getHTML();
      
      // Traiter chaque élément
      const processElement = (element: Element) => {
        const tagName = element.tagName.toLowerCase();
        const textContent = element.textContent?.trim() || '';
        
        if (!textContent) return;
        
        switch (tagName) {
          case 'h1':
            addTextToPDF(textContent, 20, 'bold', 'center');
            currentY += 5;
            break;
          case 'h2':
            addTextToPDF(textContent, 16, 'bold', 'left');
            currentY += 3;
            break;
          case 'h3':
            addTextToPDF(textContent, 14, 'bold', 'left');
            currentY += 2;
            break;
          case 'p':
            if (element.querySelector('strong, b')) {
              addTextToPDF(textContent, 12, 'bold', 'justify');
            } else {
              addTextToPDF(textContent, 12, 'normal', 'justify');
            }
            break;
          case 'li':
            addTextToPDF(`• ${textContent}`, 12, 'normal', 'left');
            break;
          case 'blockquote':
            pdf.setTextColor(100, 100, 100);
            addTextToPDF(`"${textContent}"`, 11, 'italic', 'left');
            pdf.setTextColor(0, 0, 0);
            break;
          default:
            if (textContent.length > 20) { // Éviter les textes trop courts
              addTextToPDF(textContent, 12, 'normal', 'justify');
            }
        }
      };
      
      // Parcourir tous les éléments
      Array.from(tempDiv.children).forEach(processElement);
      
      // Si pas assez de contenu, traiter les paragraphes
      if (currentY < margin + 50) {
        const paragraphs = tempDiv.querySelectorAll('p, h1, h2, h3, li');
        paragraphs.forEach(processElement);
      }
      
      // Ajouter les métadonnées du document
      pdf.setProperties({
        title: metadata.title || 'Contrat',
        creator: 'Immoo Platform',
        subject: 'Contrat généré'
      });
      
      // Générer le nom du fichier
      const fileName = generateFileName('pdf');
      
      // Sauvegarder le PDF (taille optimisée)
      pdf.save(fileName);
      
      toast.success('PDF généré avec succès ! (Taille optimisée)');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportToWord = async () => {
    if (!editor) return;
    
    setIsExportingWord(true);
    try {
      toast.info('Génération du document Word structuré...');
      
      // Créer le document DOCX
      const doc = new Document({
        creator: 'Immoo Platform',
        title: metadata.title || 'Contrat',
        description: 'Contrat généré par Immoo',
        sections: [{
          properties: {},
          children: []
        }]
      });
      
      // Parser le contenu HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.getHTML();
      
      const paragraphs: any[] = [];
      
      // Fonction pour créer des paragraphes selon le type d'élément
      const processElement = (element: Element) => {
        const tagName = element.tagName.toLowerCase();
        const textContent = element.textContent?.trim() || '';
        
        if (!textContent) return;
        
        switch (tagName) {
          case 'h1':
            paragraphs.push(
              new Paragraph({
                text: textContent,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, before: 400 }
              })
            );
            break;
            
          case 'h2':
            paragraphs.push(
              new Paragraph({
                text: textContent,
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300, before: 300 }
              })
            );
            break;
            
          case 'h3':
            paragraphs.push(
              new Paragraph({
                text: textContent,
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200, before: 200 }
              })
            );
            break;
            
          case 'p':
            const runs: TextRun[] = [];
            
            // Vérifier les éléments de style
            if (element.querySelector('strong, b')) {
              runs.push(new TextRun({ text: textContent, bold: true }));
            } else if (element.querySelector('em, i')) {
              runs.push(new TextRun({ text: textContent, italics: true }));
            } else if (element.querySelector('u')) {
              runs.push(new TextRun({ text: textContent, underline: {} }));
            } else {
              runs.push(new TextRun({ text: textContent }));
            }
            
            paragraphs.push(
              new Paragraph({
                children: runs,
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 200 },
                indent: { firstLine: 720 } // Indentation première ligne
              })
            );
            break;
            
          case 'li':
            paragraphs.push(
              new Paragraph({
                text: `• ${textContent}`,
                spacing: { after: 120 },
                indent: { left: 720 }
              })
            );
            break;
            
          case 'blockquote':
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: `"${textContent}"`, italics: true })],
                alignment: AlignmentType.LEFT,
                spacing: { after: 200, before: 200 },
                indent: { left: 720, right: 720 }
              })
            );
            break;
            
          default:
            if (textContent.length > 10) {
              paragraphs.push(
                new Paragraph({
                  text: textContent,
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 200 }
                })
              );
            }
        }
      };
      
      // Traiter tous les éléments
      Array.from(tempDiv.children).forEach(processElement);
      
      // Si pas assez de contenu, traiter les paragraphes individuels
      if (paragraphs.length === 0) {
        const allElements = tempDiv.querySelectorAll('p, h1, h2, h3, li, blockquote');
        allElements.forEach(processElement);
      }
      
      // Si toujours pas de contenu, créer un paragraphe par défaut
      if (paragraphs.length === 0) {
        paragraphs.push(
          new Paragraph({
            text: editor.getText() || 'Contenu du contrat',
            alignment: AlignmentType.JUSTIFIED
          })
        );
      }
      
      // Mettre à jour les sections du document
      doc.addSection({
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: paragraphs
      });
      
      // Générer le buffer du document
      const buffer = await Packer.toBuffer(doc);
      
      // Créer le blob
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Générer le nom du fichier
      const fileName = generateFileName('docx');
      
      // Sauvegarder le fichier
      saveAs(blob, fileName);
      
      toast.success('Document Word structuré généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du document Word:', error);
      toast.error('Erreur lors de la génération du document Word');
    } finally {
      setIsExportingWord(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Éditeur de contrat
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  
                  {contractId && availableLeases.length > 0 && (
                    <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Attribuer à un bail
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Attribuer le contrat à un bail</DialogTitle>
                          <DialogDescription>
                            Sélectionnez le bail auquel vous souhaitez attribuer ce contrat.
                          </DialogDescription>
                        </DialogHeader>
                                                  <div className="space-y-4">
                            <div className="space-y-2">
                              <span className="text-sm font-medium">Sélectionner un bail</span>
                              <select 
                                value={selectedLeaseId} 
                                onChange={(e) => setSelectedLeaseId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Choisir un bail...</option>
                                {availableLeases.map((lease) => (
                                  <option key={lease.id} value={lease.id}>
                                    {lease.title} - {lease.tenantName} ({lease.propertyName})
                                  </option>
                                ))}
                              </select>
                            </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleAssignToLease} disabled={!selectedLeaseId}>
                              Attribuer
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
              
              <div className="flex items-center gap-2 border-l pl-2">
                <span className="text-sm font-medium text-gray-600">Exporter :</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToPDF}
                  className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                  title="Télécharger en PDF"
                  disabled={isExportingPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                  {isExportingPDF && <span className="ml-2">...</span>}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToWord}
                  className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
                  title="Télécharger en Word"
                  disabled={isExportingWord}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Word
                  {isExportingWord && <span className="ml-2">...</span>}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MenuBar />
          <div className="min-h-[600px] border-2 border-gray-300 rounded-lg bg-white shadow-inner">
            <EditorContent editor={editor} />
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default ContractWysiwygEditor; 