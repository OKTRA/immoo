import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Monitor, Tablet, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestResult {
  component: string;
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

const MobileUITest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    notifications: false,
    terms: false
  });
  
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  
  const addTestResult = (component: string, test: string, status: 'success' | 'warning' | 'error', message: string) => {
    const result: TestResult = {
      component,
      test,
      status,
      message,
      timestamp: new Date()
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Garder les 10 derniers résultats
  };

  const testButtonSizes = () => {
    const buttons = document.querySelectorAll('button');
    let passCount = 0;
    let totalCount = 0;
    
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      totalCount++;
      if (rect.height >= 44) {
        passCount++;
      }
    });
    
    const status = passCount === totalCount ? 'success' : 'warning';
    addTestResult('Button', 'Taille minimale (44px)', status, `${passCount}/${totalCount} boutons conformes`);
  };

  const testInputSizes = () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    let passCount = 0;
    let totalCount = 0;
    
    inputs.forEach(input => {
      const rect = input.getBoundingClientRect();
      totalCount++;
      if (rect.height >= 44) {
        passCount++;
      }
    });
    
    const status = passCount === totalCount ? 'success' : 'warning';
    addTestResult('Input', 'Taille minimale (44px)', status, `${passCount}/${totalCount} champs conformes`);
  };

  const testResponsiveLayout = () => {
    const viewport = window.innerWidth;
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = '';
    
    if (viewport < 375) {
      status = 'warning';
      message = 'Écran très petit détecté';
    } else if (viewport < 768) {
      message = 'Layout mobile actif';
    } else if (viewport < 1024) {
      message = 'Layout tablette actif';
    } else {
      message = 'Layout desktop actif';
    }
    
    addTestResult('Layout', 'Responsive Design', status, `${viewport}px - ${message}`);
  };

  const testScrollBehavior = () => {
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    const status = hasHorizontalScroll ? 'error' : 'success';
    const message = hasHorizontalScroll ? 'Scroll horizontal détecté' : 'Pas de scroll horizontal';
    
    addTestResult('Scroll', 'Scroll horizontal', status, message);
  };

  const testTouchTargets = () => {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    let passCount = 0;
    let totalCount = 0;
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      totalCount++;
      if (rect.width >= 44 && rect.height >= 44) {
        passCount++;
      }
    });
    
    const status = passCount >= totalCount * 0.8 ? 'success' : 'warning';
    addTestResult('Touch', 'Zones tactiles', status, `${passCount}/${totalCount} éléments conformes`);
  };

  const runAllTests = () => {
    setTestResults([]);
    setTimeout(() => testButtonSizes(), 100);
    setTimeout(() => testInputSizes(), 200);
    setTimeout(() => testResponsiveLayout(), 300);
    setTimeout(() => testScrollBehavior(), 400);
    setTimeout(() => testTouchTargets(), 500);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* En-tête avec informations de plateforme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isNative ? <Smartphone className="h-5 w-5" /> : isMobile ? <Tablet className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            Test des Composants UI Mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant={isNative ? 'default' : 'secondary'}>
                {isNative ? 'Application Native' : 'Navigateur Web'}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant={isMobile ? 'default' : 'secondary'}>
                {isMobile ? 'Interface Mobile' : 'Interface Desktop'}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline">
                {window.innerWidth}px × {window.innerHeight}px
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={runAllTests} className="w-full sm:w-auto">
              Lancer Tous les Tests
            </Button>
            <Button onClick={testButtonSizes} variant="outline" className="w-full sm:w-auto">
              Test Boutons
            </Button>
            <Button onClick={testInputSizes} variant="outline" className="w-full sm:w-auto">
              Test Champs
            </Button>
            <Button onClick={clearResults} variant="destructive" className="w-full sm:w-auto">
              Effacer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Composants de test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de test */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Entrez votre nom"
                className="min-h-[44px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                className="min-h-[44px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Votre message..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: !!checked }))}
              />
              <Label htmlFor="notifications" className="text-sm">
                Recevoir les notifications
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: checked }))}
              />
              <Label htmlFor="terms" className="text-sm">
                J'accepte les conditions d'utilisation
              </Label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="w-full sm:w-auto min-h-[44px]">
                Envoyer
              </Button>
              <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau de test */}
        <Card>
          <CardHeader>
            <CardTitle>Tableau Responsive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" className="min-h-[36px]">
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de test */}
      <Card>
        <CardHeader>
          <CardTitle>Test de Dialog Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto min-h-[44px]">
                Ouvrir Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg">
              <DialogHeader>
                <DialogTitle>Dialog de Test Mobile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ce dialog teste l'affichage mobile avec un contenu adaptatif.
                </p>
                <div className="space-y-2">
                  <Label>Champ de test</Label>
                  <Input placeholder="Test dans dialog" className="min-h-[44px]" />
                </div>
                <Tabs defaultValue="tab1">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
                    <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="space-y-2">
                    <p className="text-sm">Contenu de l'onglet 1</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="space-y-2">
                    <p className="text-sm">Contenu de l'onglet 2</p>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <Badge variant="outline" className="w-fit">
                        {result.component}
                      </Badge>
                      <span className="font-medium text-sm">{result.test}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileUITest;